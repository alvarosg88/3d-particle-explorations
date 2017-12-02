(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Loader = require('../loader');
var System = require('./system');

window.demoNum = 8;
var loader = new Loader(System);

},{"../loader":3,"./system":2}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SystemBase = require('../system-base');
var Osc = require('../utils/osc');

var System = function (_SystemBase) {
	_inherits(System, _SystemBase);

	function System(loader) {
		_classCallCheck(this, System);

		var _this = _possibleConstructorReturn(this, (System.__proto__ || Object.getPrototypeOf(System)).call(this, loader));

		_this.duration = 9300;
		_this.simplex = new FastSimplexNoise();
		_this.color = new THREE.Color();

		_this.texture = _this.generateTexture();
		_this.size = 10;
		_this.scale = 1;
		_this.base = 20;
		_this.count = _this.base * _this.base * _this.base;
		_this.geometry = new THREE.BufferGeometry();
		_this.parts = [];

		_this.positions = new Float32Array(_this.count * 3);
		_this.colors = new Float32Array(_this.count * 4);
		_this.sizes = new Float32Array(_this.count);

		_this.geometry.addAttribute('position', new THREE.BufferAttribute(_this.positions, 3));
		_this.geometry.addAttribute('color', new THREE.BufferAttribute(_this.colors, 4));
		_this.geometry.addAttribute('size', new THREE.BufferAttribute(_this.sizes, 1));

		for (var i = 0; i < _this.count; i++) {
			var size = _this.calc.rand(0.1, 0.8);
			_this.parts.push({
				offset: 0,
				pos: new THREE.Vector3(_this.calc.rand(-_this.size / 2, _this.size / 2), _this.calc.rand(-_this.size / 2, _this.size / 2), _this.calc.rand(-_this.size / 2, _this.size / 2)),
				baseSize: size,
				size: size,
				r: 1,
				g: 1,
				b: 1,
				a: 0,
				life: 2,
				decay: _this.calc.rand(0.05, 0.15),
				firstRun: true
			});
		}

		_this.material = new THREE.ShaderMaterial({
			uniforms: {
				texture: {
					type: 't',
					value: _this.texture
				}
			},
			vertexShader: '\n\t\t\t\tattribute float size;\n\t\t\t\tattribute vec4 color;\n\t\t\t\tvarying vec4 vColor;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvColor = color;\n\t\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n\t\t\t\t\tgl_PointSize = size * (300.0 / length(mvPosition.xyz));\n\t\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n\t\t\t\t}\n\t\t\t',
			fragmentShader: '\n\t\t\t\tuniform sampler2D texture;\n\t\t\t\tvarying vec4 vColor;\n\t\t\t\tvoid main(void) {\n\t\t\t\t\tgl_FragColor = vColor * texture2D(texture, gl_PointCoord);\n\t\t\t\t}\n\t\t\t',
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		_this.mesh = new THREE.Points(_this.geometry, _this.material);
		_this.particleGroup.add(_this.mesh);

		_this.updateParticleAttributes(true, true, true);

		_this.reset();
		return _this;
	}

	_createClass(System, [{
		key: 'reset',
		value: function reset() {
			this.osc = new Osc(0, 0.015, true, false);
		}
	}, {
		key: 'generateTexture',
		value: function generateTexture() {
			var c = document.createElement('canvas');
			var ctx = c.getContext('2d');
			var size = 64;
			c.width = size;
			c.height = size;

			var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
			gradient.addColorStop(0, 'hsla(0, 0%, 100%, 1)');
			gradient.addColorStop(1, 'hsla(0, 0%, 100%, 0)');

			ctx.beginPath();
			ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
			ctx.fillStyle = gradient;
			ctx.fill();

			var texture = new THREE.Texture(c);
			texture.needsUpdate = true;

			return texture;
		}
	}, {
		key: 'updateParticleAttributes',
		value: function updateParticleAttributes(color, position, size) {
			var i = this.count;
			while (i--) {
				var part = this.parts[i];
				if (color) {
					this.colors[i * 4 + 0] = part.r;
					this.colors[i * 4 + 1] = part.g;
					this.colors[i * 4 + 2] = part.b;
					this.colors[i * 4 + 3] = part.a;
				}
				if (position) {
					this.positions[i * 3 + 0] = part.pos.x;
					this.positions[i * 3 + 1] = part.pos.y;
					this.positions[i * 3 + 2] = part.pos.z;
				}
				if (size) {
					this.sizes[i] = part.size;
				}
			}

			if (color) {
				this.geometry.attributes.color.needsUpdate = true;
			}
			if (position) {
				this.geometry.attributes.position.needsUpdate = true;
			}
			if (size) {
				this.geometry.attributes.size.needsUpdate = true;
			}
		}
	}, {
		key: 'replay',
		value: function replay() {
			_get(System.prototype.__proto__ || Object.getPrototypeOf(System.prototype), 'replay', this).call(this);
			this.reset();
		}
	}, {
		key: 'update',
		value: function update() {
			_get(System.prototype.__proto__ || Object.getPrototypeOf(System.prototype), 'update', this).call(this);

			this.osc.update(this.loader.dtN);
			this.oscEased = this.osc.val(this.ease.inOutExpo);

			if (this.exiting && !this.loader.isOrbit && !this.loader.isGrid) {
				this.loader.camera.position.z = this.loader.cameraBaseZ - this.ease.inExpo(this.exitProg, 0, 1, 1) * this.loader.cameraBaseZ;
			}

			var i = this.count;

			var noiseDiv = 10;
			var noiseTime = this.loader.elapsedMs * 0.0008;
			var noiseVel = this.calc.map(this.oscEased, 0, 1, 0, 1);

			while (i--) {
				var part = this.parts[i];

				var xDiv = part.pos.x / noiseDiv;
				var yDiv = part.pos.y / noiseDiv;
				var zDiv = part.pos.z / noiseDiv;

				var noise1 = this.simplex.getRaw4DNoise(xDiv, yDiv, zDiv, noiseTime) * 0.5 + 0.5;
				var noise2 = this.simplex.getRaw4DNoise(xDiv + 100, yDiv + 100, zDiv + 100, 50 + noiseTime) * 0.5 + 0.5;
				var noise3 = this.simplex.getRaw4DNoise(xDiv + 200, yDiv + 200, zDiv + 200, 100 + noiseTime) * 0.5 + 0.5;

				part.pos.x += Math.sin(noise1 * Math.PI * 2) * noiseVel * this.loader.dtN;
				part.pos.y += Math.sin(noise2 * Math.PI * 2) * noiseVel * this.loader.dtN;
				part.pos.z += Math.sin(noise3 * Math.PI * 2) * noiseVel * this.loader.dtN;

				if (part.life > 0) {
					part.life -= part.decay * this.oscEased;
				}

				if (part.life <= 0 || part.firstRun) {
					part.life = 2;
					part.pos.x = this.calc.rand(-this.size / 2, this.size / 2);
					part.pos.y = this.calc.rand(-this.size / 2, this.size / 2);
					part.pos.z = this.calc.rand(-this.size / 2, this.size / 2);

					var hue = (this.loader.elapsedMs / 25 + this.calc.rand(60)) % 360 + 110;
					var lightness = Math.round(this.calc.rand(10, 50));
					this.color.set('hsl(' + hue + ', 85%, ' + lightness + '%)');

					part.r = this.color.r;
					part.g = this.color.g;
					part.b = this.color.b;

					part.firstRun = false;
				}

				part.a = part.life > 1 ? 2 - part.life : part.life;

				part.size = this.calc.map(this.oscEased, 0, 1, part.baseSize * 4, part.baseSize * 1);
			}

			this.updateParticleAttributes(true, true, true);

			this.particleGroup.rotation.y += 0.005 + this.oscEased * 0.04;
			this.particleGroup.position.z = 5 - this.oscEased * 15;
		}
	}]);

	return System;
}(SystemBase);

module.exports = System;

},{"../system-base":4,"../utils/osc":8}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Calc = require('./utils/calc');
var Ease = require('./utils/ease');
var AxisHelper = require('./utils/axis');

var Loader = function () {
	function Loader(System) {
		_classCallCheck(this, Loader);

		this.calc = new Calc();
		this.ease = new Ease();

		this.container = document.querySelector('.loader');
		this.replayButton = document.querySelector('.replay-loader');
		this.debugButton = document.querySelector('.icon--debug');
		document.documentElement.classList.add('loading');

		this.width = null;
		this.height = null;
		this.completed = false;
		this.raf = null;

		this.setupDebug();
		this.setupTime();
		this.setupScene();
		this.setupCamera();
		this.setupRenderer();
		this.setupControls();
		this.setupHelpers();
		this.listen();
		this.onResize();

		this.system = new System(this);
		this.loop();
	}

	_createClass(Loader, [{
		key: 'setupDebug',
		value: function setupDebug() {
			var _this = this;

			this.isDebug = location.hash.indexOf('debug') > 0;
			this.isGrid = location.hash.indexOf('grid') > 0;
			this.isOrbit = location.hash.indexOf('orbit') > 0;

			this.debugHash = '';

			if (this.isDebug) {
				this.isGrid = true;
				this.isOrbit = true;
				this.debugHash += 'debug';
			} else {
				this.debugHash += this.isGrid ? 'grid' : '';
				this.debugHash += this.isOrbit ? 'orbit' : '';
			}

			if (this.debugHash) {
				[].slice.call(document.querySelectorAll('.demo')).forEach(function (elem, i, arr) {
					elem.setAttribute('href', elem.getAttribute('href') + '#' + _this.debugHash);
				});
			}
		}
	}, {
		key: 'setupTime',
		value: function setupTime() {
			this.clock = new THREE.Clock();
			this.dtS = this.clock.getDelta();
			this.dtMs = this.dtS * 1000;
			this.dtN = this.calc.clamp(this.dtMs / (1000 / 60), 0.25, 3);
			this.elapsedMs = 0;
		}
	}, {
		key: 'setupScene',
		value: function setupScene() {
			this.scene = new THREE.Scene();
		}
	}, {
		key: 'setupCamera',
		value: function setupCamera() {
			this.camera = new THREE.PerspectiveCamera(100, 0, 0.0001, 10000);

			this.cameraBaseX = this.isGrid ? -20 : 0;
			this.cameraBaseY = this.isGrid ? 15 : 0;
			this.cameraBaseZ = this.isGrid ? 20 : 35;

			this.camera.position.x = this.cameraBaseX;
			this.camera.position.y = this.cameraBaseY;
			this.camera.position.z = this.cameraBaseZ;
		}
	}, {
		key: 'setupRenderer',
		value: function setupRenderer() {
			this.renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true
			});

			this.container.appendChild(this.renderer.domElement);
		}
	}, {
		key: 'setupControls',
		value: function setupControls() {
			if (this.isOrbit) {
				this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
				this.controls.enableDamping = true;
				this.controls.dampingFactor = 0.2;
				this.controls.enableKeys = false;
			}
		}
	}, {
		key: 'setupHelpers',
		value: function setupHelpers() {
			if (this.isGrid) {
				this.gridOpacityMap = [0.4, // 1
				0.2, // 2
				0.2, // 3
				0.2, // 4
				0.1, // 5
				0.2, // 6
				0.1, // 7
				0.1 // 8
				];
				this.gridHelper = new THREE.GridHelper(100, 20, 0xffffff, 0xffffff);
				this.gridHelper.material.transparent = true;
				this.gridHelper.material.opacity = this.gridOpacityMap[demoNum - 1];
				this.scene.add(this.gridHelper);

				this.axisOpacityMap = [1, // 1
				0.6, // 2
				0.6, // 3
				0.6, // 4
				0.3, // 5
				0.6, // 6
				0.3, // 7
				0.3 // 8
				];
				this.axisHelper = new AxisHelper(50, this.axisOpacityMap[demoNum - 1]);
				this.scene.add(this.axisHelper);

				this.camera.lookAt(new THREE.Vector3());
			}
		}
	}, {
		key: 'update',
		value: function update() {
			this.dtS = this.clock.getDelta();
			this.dtMs = this.dtS * 1000;
			this.dtN = this.calc.clamp(this.dtMs / (1000 / 60), 0.25, 3);
			this.elapsedMs += this.dtMs;

			this.system.update();

			if (this.isOrbit) {
				this.controls.update();
			}
		}
	}, {
		key: 'render',
		value: function render() {
			this.renderer.render(this.scene, this.camera);
		}
	}, {
		key: 'listen',
		value: function listen() {
			var _this2 = this;

			window.addEventListener('resize', function (e) {
				return _this2.onResize(e);
			});
			this.replayButton.addEventListener('click', function (e) {
				return _this2.onReplayButtonClick(e);
			});
			this.debugButton.addEventListener('click', function (e) {
				return _this2.onDebugButtonClick(e);
			});
		}
	}, {
		key: 'replay',
		value: function replay() {
			document.documentElement.classList.remove('completed');
			document.documentElement.classList.add('loading');

			this.camera.position.x = this.cameraBaseX;
			this.camera.position.y = this.cameraBaseY;
			this.camera.position.z = this.cameraBaseZ;

			this.elapsedMs = 0;
			this.system.replay();
			this.completed = false;
			this.clock.start();
			this.loop();
		}
	}, {
		key: 'complete',
		value: function complete() {
			var _this3 = this;

			if (this.isOrbit || this.isGrid) {
				return;
			}
			setTimeout(function () {
				_this3.clock.stop();
				cancelAnimationFrame(_this3.raf);
			}, 600);
			this.completed = true;
			document.documentElement.classList.remove('loading');
			document.documentElement.classList.add('completed');
		}
	}, {
		key: 'onResize',
		value: function onResize() {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.dpr = window.devicePixelRatio > 1 ? 2 : 1;

			this.camera.aspect = this.width / this.height;
			this.camera.updateProjectionMatrix();

			this.renderer.setPixelRatio(this.dpr);
			this.renderer.setSize(this.width, this.height);
		}
	}, {
		key: 'onReplayButtonClick',
		value: function onReplayButtonClick(e) {
			e.preventDefault();
			this.replay();
		}
	}, {
		key: 'onDebugButtonClick',
		value: function onDebugButtonClick(e) {
			e.preventDefault();
			var baseURL = window.location.href.split('#')[0];
			if (this.isDebug) {
				if (history) {
					history.pushState('', document.title, window.location.pathname);
				} else {
					location.hash = '';
				}
				location.href = baseURL;
			} else {
				location.href = baseURL + '#debug';
			}
			location.reload();
		}
	}, {
		key: 'loop',
		value: function loop() {
			var _this4 = this;

			this.update();
			this.render();
			this.raf = window.requestAnimationFrame(function () {
				return _this4.loop();
			});
		}
	}]);

	return Loader;
}();

module.exports = Loader;

},{"./utils/axis":5,"./utils/calc":6,"./utils/ease":7}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SystemBase = function () {
	function SystemBase(loader) {
		_classCallCheck(this, SystemBase);

		this.loader = loader;

		this.calc = this.loader.calc;
		this.ease = this.loader.ease;

		this.sphereGeometry = new THREE.SphereBufferGeometry(1, 12, 12);
		this.boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);

		this.particles = [];
		this.particleGroup = new THREE.Object3D();
		this.particleGroup.scale.set(0.0001, 0.0001, 0.0001);

		this.loader.scene.add(this.particleGroup);

		this.entering = true;
		this.enterProg = 0;
		this.enterRate = 0.015;

		this.exiting = false;
		this.exitProg = 0;
		this.exitRate = 0.01;
		this.duration = Infinity;
	}

	_createClass(SystemBase, [{
		key: "update",
		value: function update() {
			var i = this.particles.length;
			while (i--) {
				this.particles[i].update();
			}

			if (this.entering && this.enterProg < 1) {
				this.enterProg += this.enterRate * this.loader.dtN;
				if (this.enterProg > 1) {
					this.enterProg = 1;
					this.entering = false;
				}
				var scale = this.ease.inOutExpo(this.enterProg, 0, 1, 1);
				this.particleGroup.scale.set(scale, scale, scale);
			}

			if (!this.exiting && this.loader.elapsedMs > this.duration) {
				this.exiting = true;
			}

			if (this.exiting) {
				this.exitProg += this.exitRate * this.loader.dtN;
				if (this.exitProg >= 1 && !this.loader.completed) {
					this.exitProg = 1;
					this.loader.complete();
				}
			}
		}
	}, {
		key: "replay",
		value: function replay() {
			this.particleGroup.scale.set(0.0001, 0.0001, 0.0001);

			var i = this.particles.length;
			while (i--) {
				this.particles[i].reset();
			}

			this.entering = true;
			this.enterProg = 0;

			this.exiting = false;
			this.exitProg = 0;
		}
	}]);

	return SystemBase;
}();

module.exports = SystemBase;

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AxisHelper = function () {
	function AxisHelper(axisLength, opacity) {
		_classCallCheck(this, AxisHelper);

		this.object3d = new THREE.Object3D();
		this.axisLength = axisLength;
		this.opacity = opacity;

		this.createAxis(new THREE.Vector3(-this.axisLength, 0, 0), new THREE.Vector3(this.axisLength, 0, 0), new THREE.Color('hsl(0, 100%, 100%)'));

		this.createAxis(new THREE.Vector3(0, -this.axisLength, 0), new THREE.Vector3(0, this.axisLength, 0), new THREE.Color('hsl(120, 100%, 100%)'));

		this.createAxis(new THREE.Vector3(0, 0, -this.axisLength), new THREE.Vector3(0, 0, this.axisLength), new THREE.Color('hsl(240, 100%, 100%)'));

		return this.object3d;
	}

	_createClass(AxisHelper, [{
		key: 'createAxis',
		value: function createAxis(p1, p2, color) {
			var geom = new THREE.Geometry();
			var mat = new THREE.LineBasicMaterial({
				color: color,
				opacity: this.opacity,
				transparent: true
			});
			geom.vertices.push(p1, p2);
			var line = new THREE.Line(geom, mat);
			this.object3d.add(line);
		}
	}]);

	return AxisHelper;
}();

module.exports = AxisHelper;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Calc = function () {
	function Calc() {
		_classCallCheck(this, Calc);
	}

	_createClass(Calc, [{
		key: "rand",


		/*
  ------------------------------------------
  | rand:float - returns random float
  |
  | min:number - minimum value
  | max:number - maximum value
  | ease:function - easing function to apply to the random value
  |
  | Get a random float between two values,
  | with the option of easing bias.
  ------------------------------------------ */
		value: function rand(min, max, ease) {
			if (max === undefined) {
				max = min;
				min = 0;
			}
			var random = Math.random();
			if (ease) {
				random = ease(Math.random(), 0, 1, 1);
			}
			return random * (max - min) + min;
		}

		/*
  ------------------------------------------
  | randInt:integer - returns random integer
  |
  | min:number - minimum value
  | max:number - maximum value
  | ease:function - easing function to apply to the random value
  |
  | Get a random integer between two values,
  | with the option of easing bias.
  ------------------------------------------ */

	}, {
		key: "randInt",
		value: function randInt(min, max, ease) {
			if (max === undefined) {
				max = min;
				min = 0;
			}
			var random = Math.random();
			if (ease) {
				random = ease(Math.random(), 0, 1, 1);
			}
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		/*
  ------------------------------------------
  | randArr:item - returns random iem from array
  |
  | arr:array - the array to randomly pull from
  |
  | Get a random item from an array.
  ------------------------------------------ */

	}, {
		key: "randArr",
		value: function randArr(arr) {
			return arr[Math.floor(Math.random() * arr.length)];
		}

		/*
  ------------------------------------------
  | map:number - returns a mapped value
  |
  | val:number - input value
  | inputMin:number - minimum of input range
  | inputMax:number - maximum of input range
  | outputMin:number - minimum of output range
  | outputMax:number - maximum of output range
  |
  | Get a mapped value from and input min/max
  | to an output min/max.
  ------------------------------------------ */

	}, {
		key: "map",
		value: function map(val, inputMin, inputMax, outputMin, outputMax) {
			return (outputMax - outputMin) * ((val - inputMin) / (inputMax - inputMin)) + outputMin;
		}

		/*
  ------------------------------------------
  | clamp:number - returns clamped value
  |
  | val:number - value to be clamped
  | min:number - minimum of clamped range
  | max:number - maximum of clamped range
  |
  | Clamp a value to a min/max range.
  ------------------------------------------ */

	}, {
		key: "clamp",
		value: function clamp(val, min, max) {
			return Math.max(Math.min(val, max), min);
		}
	}, {
		key: "lerp",
		value: function lerp(current, target, mix) {
			return current + (target - current) * mix;
		}

		/*
  ------------------------------------------
  | roundToUpperInterval:number - returns rounded up value
  |
  | value:number - value to be rounded
  | interval:number - interval
  |
  | Round up a value to the next highest interval.
  ------------------------------------------ */

	}, {
		key: "roundToUpperInterval",
		value: function roundToUpperInterval(value, interval) {
			if (value % interval === 0) {
				value += 0.0001;
			}
			return Math.ceil(value / interval) * interval;
		}

		/*
  ------------------------------------------
  | roundDownToInterval:number - returns rounded down value
  |
  | value:number - value to be rounded
  | interval:number - interval
  |
  | Round down a value to the next lowest interval.
  ------------------------------------------ */

	}, {
		key: "roundToLowerInterval",
		value: function roundToLowerInterval(value, interval) {
			if (value % interval === 0) {
				value -= 0.0001;
			}
			return Math.floor(value / interval) * interval;
		}

		/*
  ------------------------------------------
  | roundToNearestInterval:number - returns rounded value
  |
  | value:number - value to be rounded
  | interval:number - interval
  |
  | Round a value to the nearest interval.
  ------------------------------------------ */

	}, {
		key: "roundToNearestInterval",
		value: function roundToNearestInterval(value, interval) {
			return Math.round(value / interval) * interval;
		}

		/*
  ------------------------------------------
  | intersectSphere:boolean - returns if intersecting or not
  |
  | a:object - sphere 1 with radius, x, y, and z
  | b:object - sphere 2 with radius, x, y, and z
  |
  | Check if two sphere are intersecting
  | in 3D space.
  ------------------------------------------ */

	}, {
		key: "intersectSphere",
		value: function intersectSphere(a, b) {
			var distance = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) + (a.z - b.z) * (a.z - b.z));
			return distance < a.radius + b.radius;
		}

		/*
  ------------------------------------------
  | getIndexFromCoords:number - returns index
  |
  | x:number - x value (column)
  | y:number - y value (row)
  | w:number - width of grid
  |
  | Convert from grid coords to index.
  ------------------------------------------ */

	}, {
		key: "getIndexFromCoords",
		value: function getIndexFromCoords(x, y, w) {
			return x + y * w;
		}

		/*
  ------------------------------------------
  | getCoordsFromIndex:object - returns coords
  |
  | i:number - index
  | w:number - width of grid
  |
  | Convert from index to grid coords.
  ------------------------------------------ */

	}, {
		key: "getCoordsFromIndex",
		value: function getCoordsFromIndex(i, w) {
			return {
				x: i % w,
				y: Math.floor(i / w)
			};
		}
	}, {
		key: "visibleHeightAtZDepth",
		value: function visibleHeightAtZDepth(depth, camera) {
			// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
			var cameraOffset = camera.position.z;
			if (depth < cameraOffset) depth -= cameraOffset;else depth += cameraOffset;
			var vFOV = camera.fov * Math.PI / 180;
			return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
		}
	}, {
		key: "visibleWidthAtZDepth",
		value: function visibleWidthAtZDepth(depth, camera) {
			// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
			var height = this.visibleHeightAtZDepth(depth, camera);
			return height * camera.aspect;
		}
	}]);

	return Calc;
}();

module.exports = Calc;

},{}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ease = function () {
	function Ease() {
		_classCallCheck(this, Ease);
	}

	/*
 ------------------------------------------
 | inQuad:float - returns eased float value
 |
 | t:number - current time
 | b:number - beginning value
 | c:number - change in value
 | d:number - duration
 |
 | Get an eased float value based on inQuad.
 ------------------------------------------ */


	_createClass(Ease, [{
		key: "inQuad",
		value: function inQuad(t, b, c, d) {
			return c * (t /= d) * t + b;
		}

		/*
  ------------------------------------------
  | outQuad:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outQuad.
  ------------------------------------------ */

	}, {
		key: "outQuad",
		value: function outQuad(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		}

		/*
  ------------------------------------------
  | inOutQuad:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutQuad.
  ------------------------------------------ */

	}, {
		key: "inOutQuad",
		value: function inOutQuad(t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t + b;
			return -c / 2 * (--t * (t - 2) - 1) + b;
		}

		/*
  ------------------------------------------
  | inCubic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inCubic.
  ------------------------------------------ */

	}, {
		key: "inCubic",
		value: function inCubic(t, b, c, d) {
			return c * (t /= d) * t * t + b;
		}

		/*
  ------------------------------------------
  | outCubic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outCubic.
  ------------------------------------------ */

	}, {
		key: "outCubic",
		value: function outCubic(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		}

		/*
  ------------------------------------------
  | inOutCubic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutCubic.
  ------------------------------------------ */

	}, {
		key: "inOutCubic",
		value: function inOutCubic(t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t + 2) + b;
		}

		/*
  ------------------------------------------
  | inQuart:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inQuart.
  ------------------------------------------ */

	}, {
		key: "inQuart",
		value: function inQuart(t, b, c, d) {
			return c * (t /= d) * t * t * t + b;
		}

		/*
  ------------------------------------------
  | outQuart:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outQuart.
  ------------------------------------------ */

	}, {
		key: "outQuart",
		value: function outQuart(t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		}

		/*
  ------------------------------------------
  | inOutQuart:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutQuart.
  ------------------------------------------ */

	}, {
		key: "inOutQuart",
		value: function inOutQuart(t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
			return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
		}

		/*
  ------------------------------------------
  | inQuint:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inQuint.
  ------------------------------------------ */

	}, {
		key: "inQuint",
		value: function inQuint(t, b, c, d) {
			return c * (t /= d) * t * t * t * t + b;
		}

		/*
  ------------------------------------------
  | outQuint:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outQuint.
  ------------------------------------------ */

	}, {
		key: "outQuint",
		value: function outQuint(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		}

		/*
  ------------------------------------------
  | inOutQuint:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutQuint.
  ------------------------------------------ */

	}, {
		key: "inOutQuint",
		value: function inOutQuint(t, b, c, d) {
			if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
		}

		/*
  ------------------------------------------
  | inSine:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inSine.
  ------------------------------------------ */

	}, {
		key: "inSine",
		value: function inSine(t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		}

		/*
  ------------------------------------------
  | outSine:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outSine.
  ------------------------------------------ */

	}, {
		key: "outSine",
		value: function outSine(t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		}

		/*
  ------------------------------------------
  | inOutSine:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutSine.
  ------------------------------------------ */

	}, {
		key: "inOutSine",
		value: function inOutSine(t, b, c, d) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		}

		/*
  ------------------------------------------
  | inExpo:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inExpo.
  ------------------------------------------ */

	}, {
		key: "inExpo",
		value: function inExpo(t, b, c, d) {
			return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
		}

		/*
  ------------------------------------------
  | outExpo:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outExpo.
  ------------------------------------------ */

	}, {
		key: "outExpo",
		value: function outExpo(t, b, c, d) {
			return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		}

		/*
  ------------------------------------------
  | inOutExpo:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutExpo.
  ------------------------------------------ */

	}, {
		key: "inOutExpo",
		value: function inOutExpo(t, b, c, d) {
			if (t == 0) return b;
			if (t == d) return b + c;
			if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		}

		/*
  ------------------------------------------
  | inCirc:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inCirc.
  ------------------------------------------ */

	}, {
		key: "inCirc",
		value: function inCirc(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		}

		/*
  ------------------------------------------
  | outCirc:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outCirc.
  ------------------------------------------ */

	}, {
		key: "outCirc",
		value: function outCirc(t, b, c, d) {
			return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
		}

		/*
  ------------------------------------------
  | inOutCirc:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutCirc.
  ------------------------------------------ */

	}, {
		key: "inOutCirc",
		value: function inOutCirc(t, b, c, d) {
			if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
			return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		}

		/*
  ------------------------------------------
  | inElastic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inElastic.
  ------------------------------------------ */

	}, {
		key: "inElastic",
		value: function inElastic(t, b, c, d) {
			var s = 1.70158;var p = 0;var a = c;
			if (t == 0) return b;if ((t /= d) == 1) return b + c;if (!p) p = d * .3;
			if (a < Math.abs(c)) {
				a = c;var _s = p / 4;
			} else s = p / (2 * Math.PI) * Math.asin(c / a);
			return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}

		/*
  ------------------------------------------
  | outElastic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on outElastic.
  ------------------------------------------ */

	}, {
		key: "outElastic",
		value: function outElastic(t, b, c, d) {
			var s = 1.70158;var p = 0;var a = c;
			if (t == 0) return b;if ((t /= d) == 1) return b + c;if (!p) p = d * .3;
			if (a < Math.abs(c)) {
				a = c;var _s2 = p / 4;
			} else s = p / (2 * Math.PI) * Math.asin(c / a);
			return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
		}

		/*
  ------------------------------------------
  | inOutElastic:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  |
  | Get an eased float value based on inOutElastic.
  ------------------------------------------ */

	}, {
		key: "inOutElastic",
		value: function inOutElastic(t, b, c, d) {
			var s = 1.70158;var p = 0;var a = c;
			if (t == 0) return b;if ((t /= d / 2) == 2) return b + c;if (!p) p = d * (.3 * 1.5);
			if (a < Math.abs(c)) {
				a = c;var _s3 = p / 4;
			} else s = p / (2 * Math.PI) * Math.asin(c / a);
			if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
		}

		/*
  ------------------------------------------
  | inBack:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  | s:number - strength
  |
  | Get an eased float value based on inBack.
  ------------------------------------------ */

	}, {
		key: "inBack",
		value: function inBack(t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		}

		/*
  ------------------------------------------
  | outBack:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  | s:number - strength
  |
  | Get an eased float value based on outBack.
  ------------------------------------------ */

	}, {
		key: "outBack",
		value: function outBack(t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		}

		/*
  ------------------------------------------
  | inOutBack:float - returns eased float value
  |
  | t:number - current time
  | b:number - beginning value
  | c:number - change in value
  | d:number - duration
  | s:number - strength
  |
  | Get an eased float value based on inOutBack.
  ------------------------------------------ */

	}, {
		key: "inOutBack",
		value: function inOutBack(t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
			return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
		}
	}]);

	return Ease;
}();

module.exports = Ease;

},{}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Osc = function () {
	function Osc(val, rate) {
		var dir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
		var flip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		_classCallCheck(this, Osc);

		this._baseVal = val;
		this._baseRate = rate;
		this._baseDir = dir;
		this._baseFlip = flip;

		this._val = val;
		this._rate = rate;
		this._dir = dir;
		this._flip = flip;

		this._trigger = false;
		this._triggerTop = false;
		this._triggerBot = false;
	}

	_createClass(Osc, [{
		key: "reset",
		value: function reset() {
			this._val = this._baseVal;
			this._rate = this._baseRate;
			this._dir = this._baseDir;
			this._flip = this._baseFlip;
		}
	}, {
		key: "update",
		value: function update(dt) {
			this._trigger = false;
			this._triggerTop = false;
			this._triggerBot = false;
			if (this._dir) {
				if (this._val < 1) {
					this._val += this._rate * dt;
				} else {
					this._trigger = true;
					this._triggerTop = true;
					if (this._flip) {
						this._val = this._val - 1;
					} else {
						this._val = 1 - (this._val - 1);
						this._dir = !this._dir;
					}
				}
			} else {
				if (this._val > 0) {
					this._val -= this._rate * dt;
				} else {
					this._trigger = true;
					this._triggerBot = true;
					if (this._flip) {
						this._val = 1 + this._val;
					} else {
						this._val = -this._val;
						this._dir = !this._dir;
					}
				}
			}
		}
	}, {
		key: "val",
		value: function val(ease) {
			if (ease) {
				return ease(this._val, 0, 1, 1);
			} else {
				return this._val;
			}
		}
	}]);

	return Osc;
}();

module.exports = Osc;

},{}]},{},[1]);
