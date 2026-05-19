// Minimal Three.js arrow visualization for a basis direction
export class Basis3D {
  constructor(container) {
    this.container = container;
    this.w = container.clientWidth || 400;
    this.h = Math.max(360, container.clientHeight || 360);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8f9fc);
    this.camera = new THREE.PerspectiveCamera(50, this.w/this.h, 0.1, 1000);
    this.camera.position.set(2,2,2);
    this.camera.lookAt(0,0,0);
    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setSize(this.w, this.h);
    this.renderer.setClearColor(0xf8f9fc, 1);
    container.appendChild(this.renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff,1);
    light.position.set(5,5,5); this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x404040));
    const grid = new THREE.GridHelper(4,8); this.scene.add(grid);
    const axes = new THREE.AxesHelper(1.6); this.scene.add(axes);

    this.radius = 3.2;
    this.azimuth = Math.PI / 4;
    this.polar = Math.PI / 4;
    this.arrows = [];
    this.fieldArrow = null;
    this.fieldGroup = null;
    this.expectationGroup = null;
    this.expectationSphere = null;
    this.expectationSphereRadius = 1.0;
    this.currentFieldDirection = new THREE.Vector3(0, 1, 0);
    this.currentExpectationVector = new THREE.Vector3(0, 0, 0);
    this.precessionCircle = null;
    // Tip local peak is cone center (1.12) + half cone height (0.12)
    this.expectationTipLocalPeak = 1.24;

    this.renderer.domElement.style.cursor = 'grab';
    this._dragging = false;
    this._lastPointer = { x: 0, y: 0 };
    this._bindPointerControls();
    this._initExpectationSphere();

    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    // Debug access for diagnostics from console/playwright.
    window.__basis3D = this;
  }

  _bindPointerControls(){
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (event) => {
      this._dragging = true;
      this._lastPointer.x = event.clientX;
      this._lastPointer.y = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this._dragging) return;
      const dx = event.clientX - this._lastPointer.x;
      const dy = event.clientY - this._lastPointer.y;
      this._lastPointer.x = event.clientX;
      this._lastPointer.y = event.clientY;
      this.azimuth -= dx * 0.01;
      this.polar = Math.max(0.15, Math.min(Math.PI - 0.15, this.polar - dy * 0.01));
      this._updateCamera();
    });
    const stopDragging = (event) => {
      if (!this._dragging) return;
      this._dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
      canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);
    canvas.addEventListener('pointerleave', stopDragging);
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const scale = Math.exp(event.deltaY * 0.001);
      this.radius = Math.min(12, Math.max(1.4, this.radius * scale));
      this._updateCamera();
    }, { passive: false });
  }

  _updateCamera(){
    const x = this.radius * Math.sin(this.polar) * Math.cos(this.azimuth);
    const y = this.radius * Math.cos(this.polar);
    const z = this.radius * Math.sin(this.polar) * Math.sin(this.azimuth);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0,0,0);
  }

  setDirectionFromThetaPhi(thetaDeg, phiDeg){
    this.defaultDirection = this._basisDirection(thetaDeg, phiDeg);
  }

  setBases(bases){
    if (this.arrows.length !== bases.length) {
      this._clearArrows();
      bases.forEach((basis) => this.arrows.push({ basis, arrow: this._createArrow(basis) }));
      return;
    }

    bases.forEach((basis, index) => {
      const entry = this.arrows[index];
      entry.basis = basis;
      const direction = this._basisDirection(basis.theta, basis.phi);
      entry.arrow.setDirection(direction);
      entry.arrow.setColor(new THREE.Color(basis.color || 0x2563eb));
    });
  }

  _createArrow(basis){
    const direction = this._basisDirection(basis.theta, basis.phi);
    const color = new THREE.Color(basis.color || 0x2563eb);
    const arrowLength = 1.6;
    const headLength = 0.26;
    const shaftLength = arrowLength - headLength;
    const shaftRadius = 0.055;
    const headRadius = 0.12;

    const group = new THREE.Group();

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 20),
      new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.92 })
    );
    shaft.position.y = shaftLength / 2;
    group.add(shaft);

    const head = new THREE.Mesh(
      new THREE.ConeGeometry(headRadius, headLength, 20),
      new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.95 })
    );
    head.position.y = shaftLength + headLength / 2;
    group.add(head);

    group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction);
    this.scene.add(group);

    return {
      group,
      shaft,
      head,
      setDirection: (dir) => {
        group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      },
      setColor: (nextColor) => {
        shaft.material.color.set(nextColor);
        head.material.color.set(nextColor);
      },
      dispose: () => {
        shaft.geometry.dispose();
        head.geometry.dispose();
        shaft.material.dispose();
        head.material.dispose();
      }
    };
  }

  setFieldDirection(thetaDeg, phiDeg, magnitude = 1){
    const direction = this._basisDirection(thetaDeg, phiDeg);
    this.currentFieldDirection = direction.clone();
    if (magnitude <= 0) {
      if (this.fieldGroup) this.fieldGroup.visible = false;
      return;
    }

    const length = Math.min(2.4, Math.max(0.7, 0.8 + magnitude * 0.18));
    const color = 0x16a34a;

    if (!this.fieldGroup) {
      this.fieldGroup = new THREE.Group();

      const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 20, 1, true);
      const shaftMaterial = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        emissive: new THREE.Color(0x0f766e),
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
      });
      this.fieldShaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
      this.fieldShaft.position.y = 0;
      this.fieldGroup.add(this.fieldShaft);

      const coreGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.14, 12, 1, true);
      const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0xa7f3d0,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(0x34d399),
        emissiveIntensity: 0.9,
        side: THREE.DoubleSide,
      });
      this.fieldCore = new THREE.Mesh(coreGeometry, coreMaterial);
      this.fieldGroup.add(this.fieldCore);

      const ringGeometry = new THREE.TorusGeometry(0.18, 0.028, 8, 24);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0xd1fae5,
        transparent: true,
        opacity: 0.85,
        emissive: new THREE.Color(0x6ee7b7),
        emissiveIntensity: 0.75,
      });
      this.fieldRingTop = new THREE.Mesh(ringGeometry, ringMaterial);
      this.fieldRingTop.rotation.x = Math.PI / 2;
      this.fieldRingTop.position.y = 0.45;
      this.fieldGroup.add(this.fieldRingTop);

      this.fieldRingBottom = new THREE.Mesh(ringGeometry, ringMaterial.clone());
      this.fieldRingBottom.rotation.x = Math.PI / 2;
      this.fieldRingBottom.position.y = -0.45;
      this.fieldGroup.add(this.fieldRingBottom);

      const pulseGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const pulseMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        emissive: new THREE.Color(0xd1fae5),
        emissiveIntensity: 1.0,
      });
      this.fieldPulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      this.fieldGroup.add(this.fieldPulse);

      this.scene.add(this.fieldGroup);
    }

    this.fieldGroup.visible = true;
    this.fieldGroup.scale.set(1, length, 1);
    this.fieldGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction);
    this.fieldRingTop.position.y = 0.45;
    this.fieldRingBottom.position.y = -0.45;
    this.fieldPulse.position.y = Math.sin(Date.now() * 0.004) * 0.33;
    this._recalculatePrecessionCircle();
  }

  setExpectationVector(x, y, z){
    const vec = new THREE.Vector3(x, y, z);
    this.currentExpectationVector = vec.clone();
    const mag = vec.length();
    if (mag < 1e-6) {
      if (this.expectationGroup) this.expectationGroup.visible = false;
      return;
    }

    const direction = vec.clone().normalize();
    // Physical scaling: rendered tip radius should equal |S| (Bloch sphere radius = 1).
    const length = mag / this.expectationTipLocalPeak;

    if (!this.expectationGroup) {
      this.expectationGroup = new THREE.Group();

      const outerShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1, 18),
        new THREE.MeshPhongMaterial({
          color: 0xec4899,
          transparent: true,
          opacity: 0.85,
          emissive: new THREE.Color(0xbe185d),
          emissiveIntensity: 0.45,
        })
      );
      outerShaft.position.y = 0.5;
      this.expectationGroup.add(outerShaft);
      this.expectationOuterShaft = outerShaft;

      const innerCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.04, 14),
        new THREE.MeshPhongMaterial({
          color: 0xfdf2f8,
          transparent: true,
          opacity: 0.95,
          emissive: new THREE.Color(0xfbcfe8),
          emissiveIntensity: 0.8,
        })
      );
      innerCore.position.y = 0.52;
      this.expectationGroup.add(innerCore);
      this.expectationCore = innerCore;

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.24, 24),
        new THREE.MeshPhongMaterial({
          color: 0xf472b6,
          transparent: true,
          opacity: 0.95,
          emissive: new THREE.Color(0xdb2777),
          emissiveIntensity: 0.7,
        })
      );
      tip.position.y = 1.12;
      this.expectationGroup.add(tip);
      this.expectationTip = tip;

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.02, 10, 28),
        new THREE.MeshPhongMaterial({
          color: 0xfbcfe8,
          transparent: true,
          opacity: 0.85,
          emissive: new THREE.Color(0xf9a8d4),
          emissiveIntensity: 0.9,
        })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 1.0;
      this.expectationGroup.add(halo);
      this.expectationHalo = halo;

      this.scene.add(this.expectationGroup);
    }

    this.expectationGroup.visible = true;
    this.expectationGroup.scale.set(1, length, 1);
    this.expectationGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction);
    this.expectationHalo.rotation.y += 0.03;
    this._recalculatePrecessionCircle();
  }

  setExpectationSphereVisible(visible){
    if (this.expectationSphere) this.expectationSphere.visible = !!visible;
  }

  _initExpectationSphere(){
    if (this.expectationSphere) return;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.expectationSphereRadius, 40, 28),
      new THREE.MeshPhongMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.18,
        emissive: new THREE.Color(0x60a5fa),
        emissiveIntensity: 0.15,
        side: THREE.DoubleSide,
      })
    );
    sphere.material.depthWrite = false;
    sphere.renderOrder = -1;

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(this.expectationSphereRadius, 26, 18)),
      new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35 })
    );
    wire.material.depthWrite = false;
    wire.renderOrder = -1;
    sphere.add(wire);

    this.scene.add(sphere);
    this.expectationSphere = sphere;
  }

  _recalculatePrecessionCircle(){
    const axis = this.currentFieldDirection.clone().normalize();
    const s = this.currentExpectationVector.clone();
    if (s.length() < 1e-6 || axis.length() < 1e-6) {
      if (this.precessionCircle) this.precessionCircle.visible = false;
      return;
    }

    const center = axis.clone().multiplyScalar(s.dot(axis));
    const perp = s.clone().sub(center);
    const radius = perp.length();
    if (radius < 1e-6) {
      if (this.precessionCircle) this.precessionCircle.visible = false;
      return;
    }

    const u = perp.clone().normalize();
    const v = new THREE.Vector3().crossVectors(axis, u).normalize();
    const segments = 128;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(
        center.clone()
          .add(u.clone().multiplyScalar(Math.cos(a) * radius))
          .add(v.clone().multiplyScalar(Math.sin(a) * radius))
      );
    }

    if (!this.precessionCircle) {
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.55 });
      this.precessionCircle = new THREE.Line(geom, mat);
      this.scene.add(this.precessionCircle);
    } else {
      this.precessionCircle.geometry.dispose();
      this.precessionCircle.geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.precessionCircle.visible = true;
    }
  }

  _basisDirection(thetaDeg, phiDeg){
    const th = thetaDeg * Math.PI/180;
    const ph = phiDeg * Math.PI/180;
    // Angles are defined in the simulation's default-basis frame.
    // Map default-frame axes -> lab-frame axes as:
    // x_default -> z_lab, y_default -> x_lab, z_default -> y_lab.
    // With n_default = (sin th cos ph, sin th sin ph, cos th), this yields:
    // n_lab = (sin th sin ph, cos th, sin th cos ph).
    return new THREE.Vector3(
      Math.sin(th) * Math.sin(ph),
      Math.cos(th),
      -Math.sin(th) * Math.cos(ph)
    ).normalize();
  }

  _clearArrows(){
    this.arrows.forEach(({ arrow }) => {
      this.scene.remove(arrow.group || arrow);
      arrow.dispose?.();
    });
    this.arrows = [];
  }

  _tick(){
    this._updateCamera();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._tick);
  }
}
