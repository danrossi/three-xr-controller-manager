import { AdditiveBlending, AnimationClip, Bone, Box3, BufferAttribute, BufferGeometry, ClampToEdgeWrapping, Color, ColorManagement, DirectionalLight, DoubleSide, EventDispatcher, FileLoader, Float32BufferAttribute, FrontSide, Group, ImageBitmapLoader, InstancedBufferAttribute, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Interpolant, InterpolateDiscrete, InterpolateLinear, Line, LineBasicMaterial, LineLoop, LineSegments, LinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearSRGBColorSpace, Loader, LoaderUtils, Material, MathUtils, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MirroredRepeatWrapping, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NumberKeyframeTrack, Object3D, OrthographicCamera, PerspectiveCamera, PointLight, Points, PointsMaterial, PropertyBinding, Quaternion, QuaternionKeyframeTrack, Raycaster, RepeatWrapping, SRGBColorSpace, Skeleton, SkinnedMesh, Sphere, SphereGeometry, SpotLight, Texture, TextureLoader, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, Vector2, Vector3, VectorKeyframeTrack } from "three";
//#region node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
function toTrianglesDrawMode(geometry, drawMode) {
	if (drawMode === TrianglesDrawMode) {
		console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
		return geometry;
	}
	if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
		let index = geometry.getIndex();
		if (index === null) {
			const indices = [];
			const position = geometry.getAttribute("position");
			if (position !== void 0) {
				for (let i = 0; i < position.count; i++) indices.push(i);
				geometry.setIndex(indices);
				index = geometry.getIndex();
			} else {
				console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
				return geometry;
			}
		}
		const numberOfTriangles = index.count - 2;
		const newIndices = [];
		if (drawMode === TriangleFanDrawMode) for (let i = 1; i <= numberOfTriangles; i++) {
			newIndices.push(index.getX(0));
			newIndices.push(index.getX(i));
			newIndices.push(index.getX(i + 1));
		}
		else for (let i = 0; i < numberOfTriangles; i++) if (i % 2 === 0) {
			newIndices.push(index.getX(i));
			newIndices.push(index.getX(i + 1));
			newIndices.push(index.getX(i + 2));
		} else {
			newIndices.push(index.getX(i + 2));
			newIndices.push(index.getX(i + 1));
			newIndices.push(index.getX(i));
		}
		if (newIndices.length / 3 !== numberOfTriangles) console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
		const newGeometry = geometry.clone();
		newGeometry.setIndex(newIndices);
		newGeometry.clearGroups();
		return newGeometry;
	} else {
		console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
		return geometry;
	}
}
//#endregion
//#region node_modules/three/examples/jsm/utils/SkeletonUtils.js
function clone(source) {
	const sourceLookup = new Map();
	const cloneLookup = new Map();
	const clone = source.clone();
	parallelTraverse(source, clone, function(sourceNode, clonedNode) {
		sourceLookup.set(clonedNode, sourceNode);
		cloneLookup.set(sourceNode, clonedNode);
	});
	clone.traverse(function(node) {
		if (!node.isSkinnedMesh) return;
		const clonedMesh = node;
		const sourceMesh = sourceLookup.get(node);
		const sourceBones = sourceMesh.skeleton.bones;
		clonedMesh.skeleton = sourceMesh.skeleton.clone();
		clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
		clonedMesh.skeleton.bones = sourceBones.map(function(bone) {
			return cloneLookup.get(bone);
		});
		clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
	});
	return clone;
}
function parallelTraverse(a, b, callback) {
	callback(a, b);
	for (let i = 0; i < a.children.length; i++) parallelTraverse(a.children[i], b.children[i], callback);
}
//#endregion
//#region node_modules/three/examples/jsm/loaders/GLTFLoader.js
var GLTFLoader = class extends Loader {
	constructor(manager) {
		super(manager);
		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;
		this.pluginCallbacks = [];
		this.register(function(parser) {
			return new GLTFMaterialsClearcoatExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsDispersionExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureBasisUExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureWebPExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureAVIFExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsSheenExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsTransmissionExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsVolumeExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsIorExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsEmissiveStrengthExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsSpecularExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsIridescenceExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsAnisotropyExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsBumpExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFLightsExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMeshoptCompression(parser, EXTENSIONS.EXT_MESHOPT_COMPRESSION);
		});
		this.register(function(parser) {
			return new GLTFMeshoptCompression(parser, EXTENSIONS.KHR_MESHOPT_COMPRESSION);
		});
		this.register(function(parser) {
			return new GLTFMeshGpuInstancing(parser);
		});
	}
	load(url, onLoad, onProgress, onError) {
		const scope = this;
		let resourcePath;
		if (this.resourcePath !== "") resourcePath = this.resourcePath;
		else if (this.path !== "") {
			const relativeUrl = LoaderUtils.extractUrlBase(url);
			resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
		} else resourcePath = LoaderUtils.extractUrlBase(url);
		this.manager.itemStart(url);
		const _onError = function(e) {
			if (onError) onError(e);
			else console.error(e);
			scope.manager.itemError(url);
			scope.manager.itemEnd(url);
		};
		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setResponseType("arraybuffer");
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(url, function(data) {
			try {
				scope.parse(data, resourcePath, function(gltf) {
					onLoad(gltf);
					scope.manager.itemEnd(url);
				}, _onError);
			} catch (e) {
				_onError(e);
			}
		}, onProgress, _onError);
	}
	setDRACOLoader(dracoLoader) {
		this.dracoLoader = dracoLoader;
		return this;
	}
	setKTX2Loader(ktx2Loader) {
		this.ktx2Loader = ktx2Loader;
		return this;
	}
	setMeshoptDecoder(meshoptDecoder) {
		this.meshoptDecoder = meshoptDecoder;
		return this;
	}
	register(callback) {
		if (this.pluginCallbacks.indexOf(callback) === -1) this.pluginCallbacks.push(callback);
		return this;
	}
	unregister(callback) {
		if (this.pluginCallbacks.indexOf(callback) !== -1) this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
		return this;
	}
	parse(data, path, onLoad, onError) {
		let json;
		const extensions = {};
		const plugins = {};
		const textDecoder = new TextDecoder();
		if (typeof data === "string") json = JSON.parse(data);
		else if (data instanceof ArrayBuffer) {
			if (textDecoder.decode(new Uint8Array(data, 0, 4)) === BINARY_EXTENSION_HEADER_MAGIC) {
				try {
					extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
				} catch (error) {
					if (onError) onError(error);
					return;
				}
				json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
			} else json = JSON.parse(textDecoder.decode(data));
		} else json = data;
		if (json.asset === void 0 || json.asset.version[0] < 2) {
			if (onError) onError(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
			return;
		}
		const parser = new GLTFParser(json, {
			path: path || this.resourcePath || "",
			crossOrigin: this.crossOrigin,
			requestHeader: this.requestHeader,
			manager: this.manager,
			ktx2Loader: this.ktx2Loader,
			meshoptDecoder: this.meshoptDecoder
		});
		parser.fileLoader.setRequestHeader(this.requestHeader);
		for (let i = 0; i < this.pluginCallbacks.length; i++) {
			const plugin = this.pluginCallbacks[i](parser);
			if (!plugin.name) console.error("THREE.GLTFLoader: Invalid plugin found: missing name");
			plugins[plugin.name] = plugin;
			extensions[plugin.name] = true;
		}
		if (json.extensionsUsed) for (let i = 0; i < json.extensionsUsed.length; ++i) {
			const extensionName = json.extensionsUsed[i];
			const extensionsRequired = json.extensionsRequired || [];
			switch (extensionName) {
				case EXTENSIONS.KHR_MATERIALS_UNLIT:
					extensions[extensionName] = new GLTFMaterialsUnlitExtension();
					break;
				case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
					extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
					break;
				case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
					extensions[extensionName] = new GLTFTextureTransformExtension();
					break;
				case EXTENSIONS.KHR_MESH_QUANTIZATION:
					extensions[extensionName] = new GLTFMeshQuantizationExtension();
					break;
				default: if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) console.warn("THREE.GLTFLoader: Unknown extension \"" + extensionName + "\".");
			}
		}
		parser.setExtensions(extensions);
		parser.setPlugins(plugins);
		parser.parse(onLoad, onError);
	}
	parseAsync(data, path) {
		const scope = this;
		return new Promise(function(resolve, reject) {
			scope.parse(data, path, resolve, reject);
		});
	}
};
function GLTFRegistry() {
	let objects = {};
	return {
		get: function(key) {
			return objects[key];
		},
		add: function(key, object) {
			objects[key] = object;
		},
		remove: function(key) {
			delete objects[key];
		},
		removeAll: function() {
			objects = {};
		}
	};
}
function getMaterialExtension(parser, materialIndex, extensionName) {
	const materialDef = parser.json.materials[materialIndex];
	if (materialDef.extensions && materialDef.extensions[extensionName]) return materialDef.extensions[extensionName];
	return null;
}
var EXTENSIONS = {
	KHR_BINARY_GLTF: "KHR_binary_glTF",
	KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
	KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
	KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
	KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
	KHR_MATERIALS_IOR: "KHR_materials_ior",
	KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
	KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
	KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
	KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
	KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
	KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
	KHR_MATERIALS_VOLUME: "KHR_materials_volume",
	KHR_TEXTURE_BASISU: "KHR_texture_basisu",
	KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
	KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
	KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
	EXT_MATERIALS_BUMP: "EXT_materials_bump",
	EXT_TEXTURE_WEBP: "EXT_texture_webp",
	EXT_TEXTURE_AVIF: "EXT_texture_avif",
	EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
	KHR_MESHOPT_COMPRESSION: "KHR_meshopt_compression",
	EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
var GLTFLightsExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
		this.cache = {
			refs: {},
			uses: {}
		};
	}
	_markDefs() {
		const parser = this.parser;
		const nodeDefs = this.parser.json.nodes || [];
		for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
			const nodeDef = nodeDefs[nodeIndex];
			if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
		}
	}
	_loadLight(lightIndex) {
		const parser = this.parser;
		const cacheKey = "light:" + lightIndex;
		let dependency = parser.cache.get(cacheKey);
		if (dependency) return dependency;
		const json = parser.json;
		const lightDef = ((json.extensions && json.extensions[this.name] || {}).lights || [])[lightIndex];
		let lightNode;
		const color = new Color(16777215);
		if (lightDef.color !== void 0) color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);
		const range = lightDef.range !== void 0 ? lightDef.range : 0;
		switch (lightDef.type) {
			case "directional":
				lightNode = new DirectionalLight(color);
				lightNode.target.position.set(0, 0, -1);
				lightNode.add(lightNode.target);
				break;
			case "point":
				lightNode = new PointLight(color);
				lightNode.distance = range;
				break;
			case "spot":
				lightNode = new SpotLight(color);
				lightNode.distance = range;
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set(0, 0, -1);
				lightNode.add(lightNode.target);
				break;
			default: throw new Error("THREE.GLTFLoader: Unexpected light type: " + lightDef.type);
		}
		lightNode.position.set(0, 0, 0);
		assignExtrasToUserData(lightNode, lightDef);
		if (lightDef.intensity !== void 0) lightNode.intensity = lightDef.intensity;
		lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
		dependency = Promise.resolve(lightNode);
		parser.cache.add(cacheKey, dependency);
		return dependency;
	}
	getDependency(type, index) {
		if (type !== "light") return;
		return this._loadLight(index);
	}
	createNodeAttachment(nodeIndex) {
		const self = this;
		const parser = this.parser;
		const nodeDef = parser.json.nodes[nodeIndex];
		const lightIndex = (nodeDef.extensions && nodeDef.extensions[this.name] || {}).light;
		if (lightIndex === void 0) return null;
		return this._loadLight(lightIndex).then(function(light) {
			return parser._getNodeRef(self.cache, lightIndex, light);
		});
	}
};
var GLTFMaterialsUnlitExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
	}
	getMaterialType() {
		return MeshBasicMaterial;
	}
	extendParams(materialParams, materialDef, parser) {
		const pending = [];
		materialParams.color = new Color(1, 1, 1);
		materialParams.opacity = 1;
		const metallicRoughness = materialDef.pbrMetallicRoughness;
		if (metallicRoughness) {
			if (Array.isArray(metallicRoughness.baseColorFactor)) {
				const array = metallicRoughness.baseColorFactor;
				materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
				materialParams.opacity = array[3];
			}
			if (metallicRoughness.baseColorTexture !== void 0) pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
		}
		return Promise.all(pending);
	}
};
var GLTFMaterialsEmissiveStrengthExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		if (extension.emissiveStrength !== void 0) materialParams.emissiveIntensity = extension.emissiveStrength;
		return Promise.resolve();
	}
};
var GLTFMaterialsClearcoatExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.clearcoatFactor !== void 0) materialParams.clearcoat = extension.clearcoatFactor;
		if (extension.clearcoatTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
		if (extension.clearcoatRoughnessFactor !== void 0) materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
		if (extension.clearcoatRoughnessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
		if (extension.clearcoatNormalTexture !== void 0) {
			pending.push(this.parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
			if (extension.clearcoatNormalTexture.scale !== void 0) {
				const scale = extension.clearcoatNormalTexture.scale;
				materialParams.clearcoatNormalScale = new Vector2(scale, scale);
			}
		}
		return Promise.all(pending);
	}
};
var GLTFMaterialsDispersionExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_DISPERSION;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		materialParams.dispersion = extension.dispersion !== void 0 ? extension.dispersion : 0;
		return Promise.resolve();
	}
};
var GLTFMaterialsIridescenceExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.iridescenceFactor !== void 0) materialParams.iridescence = extension.iridescenceFactor;
		if (extension.iridescenceTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "iridescenceMap", extension.iridescenceTexture));
		if (extension.iridescenceIor !== void 0) materialParams.iridescenceIOR = extension.iridescenceIor;
		if (materialParams.iridescenceThicknessRange === void 0) materialParams.iridescenceThicknessRange = [100, 400];
		if (extension.iridescenceThicknessMinimum !== void 0) materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
		if (extension.iridescenceThicknessMaximum !== void 0) materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
		if (extension.iridescenceThicknessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "iridescenceThicknessMap", extension.iridescenceThicknessTexture));
		return Promise.all(pending);
	}
};
var GLTFMaterialsSheenExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.sheenColor = new Color(0, 0, 0);
		materialParams.sheenRoughness = 0;
		materialParams.sheen = 1;
		if (extension.sheenColorFactor !== void 0) {
			const colorFactor = extension.sheenColorFactor;
			materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace);
		}
		if (extension.sheenRoughnessFactor !== void 0) materialParams.sheenRoughness = extension.sheenRoughnessFactor;
		if (extension.sheenColorTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "sheenColorMap", extension.sheenColorTexture, SRGBColorSpace));
		if (extension.sheenRoughnessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "sheenRoughnessMap", extension.sheenRoughnessTexture));
		return Promise.all(pending);
	}
};
var GLTFMaterialsTransmissionExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.transmissionFactor !== void 0) materialParams.transmission = extension.transmissionFactor;
		if (extension.transmissionTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
		return Promise.all(pending);
	}
};
var GLTFMaterialsVolumeExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.thickness = extension.thicknessFactor !== void 0 ? extension.thicknessFactor : 0;
		if (extension.thicknessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "thicknessMap", extension.thicknessTexture));
		materialParams.attenuationDistance = extension.attenuationDistance || Infinity;
		const colorArray = extension.attenuationColor || [
			1,
			1,
			1
		];
		materialParams.attenuationColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
		return Promise.all(pending);
	}
};
var GLTFMaterialsIorExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IOR;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		materialParams.ior = extension.ior !== void 0 ? extension.ior : 1.5;
		if (materialParams.ior === 0) materialParams.ior = 1e3;
		return Promise.resolve();
	}
};
var GLTFMaterialsSpecularExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.specularIntensity = extension.specularFactor !== void 0 ? extension.specularFactor : 1;
		if (extension.specularTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "specularIntensityMap", extension.specularTexture));
		const colorArray = extension.specularColorFactor || [
			1,
			1,
			1
		];
		materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
		if (extension.specularColorTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "specularColorMap", extension.specularColorTexture, SRGBColorSpace));
		return Promise.all(pending);
	}
};
var GLTFMaterialsBumpExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_MATERIALS_BUMP;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.bumpScale = extension.bumpFactor !== void 0 ? extension.bumpFactor : 1;
		if (extension.bumpTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "bumpMap", extension.bumpTexture));
		return Promise.all(pending);
	}
};
var GLTFMaterialsAnisotropyExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.anisotropyStrength !== void 0) materialParams.anisotropy = extension.anisotropyStrength;
		if (extension.anisotropyRotation !== void 0) materialParams.anisotropyRotation = extension.anisotropyRotation;
		if (extension.anisotropyTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "anisotropyMap", extension.anisotropyTexture));
		return Promise.all(pending);
	}
};
var GLTFTextureBasisUExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
	}
	loadTexture(textureIndex) {
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[this.name]) return null;
		const extension = textureDef.extensions[this.name];
		const loader = parser.options.ktx2Loader;
		if (!loader) {
			if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
			else return null;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
var GLTFTextureWebPExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
	}
	loadTexture(textureIndex) {
		const name = this.name;
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[name]) return null;
		const extension = textureDef.extensions[name];
		const source = json.images[extension.source];
		let loader = parser.textureLoader;
		if (source.uri) {
			const handler = parser.options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
var GLTFTextureAVIFExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
	}
	loadTexture(textureIndex) {
		const name = this.name;
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[name]) return null;
		const extension = textureDef.extensions[name];
		const source = json.images[extension.source];
		let loader = parser.textureLoader;
		if (source.uri) {
			const handler = parser.options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
var GLTFMeshoptCompression = class {
	constructor(parser, name) {
		this.name = name;
		this.parser = parser;
	}
	loadBufferView(index) {
		const json = this.parser.json;
		const bufferView = json.bufferViews[index];
		if (bufferView.extensions && bufferView.extensions[this.name]) {
			const extensionDef = bufferView.extensions[this.name];
			const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
			const decoder = this.parser.options.meshoptDecoder;
			if (!decoder || !decoder.supported) {
				if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
				else return null;
			}
			return buffer.then(function(res) {
				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;
				const count = extensionDef.count;
				const stride = extensionDef.byteStride;
				const source = new Uint8Array(res, byteOffset, byteLength);
				if (decoder.decodeGltfBufferAsync) return decoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(function(res) {
					return res.buffer;
				});
				else return decoder.ready.then(function() {
					const result = new ArrayBuffer(count * stride);
					decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
					return result;
				});
			});
		} else return null;
	}
};
var GLTFMeshGpuInstancing = class {
	constructor(parser) {
		this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
		this.parser = parser;
	}
	createNodeMesh(nodeIndex) {
		const json = this.parser.json;
		const nodeDef = json.nodes[nodeIndex];
		if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === void 0) return null;
		const meshDef = json.meshes[nodeDef.mesh];
		for (const primitive of meshDef.primitives) if (primitive.mode !== WEBGL_CONSTANTS.TRIANGLES && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN && primitive.mode !== void 0) return null;
		const attributesDef = nodeDef.extensions[this.name].attributes;
		const pending = [];
		const attributes = {};
		for (const key in attributesDef) pending.push(this.parser.getDependency("accessor", attributesDef[key]).then((accessor) => {
			attributes[key] = accessor;
			return attributes[key];
		}));
		if (pending.length < 1) return null;
		pending.push(this.parser.createNodeMesh(nodeIndex));
		return Promise.all(pending).then((results) => {
			const nodeObject = results.pop();
			const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
			const count = results[0].count;
			const instancedMeshes = [];
			for (const mesh of meshes) {
				const m = new Matrix4();
				const p = new Vector3();
				const q = new Quaternion();
				const s = new Vector3(1, 1, 1);
				const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);
				for (let i = 0; i < count; i++) {
					if (attributes.TRANSLATION) p.fromBufferAttribute(attributes.TRANSLATION, i);
					if (attributes.ROTATION) q.fromBufferAttribute(attributes.ROTATION, i);
					if (attributes.SCALE) s.fromBufferAttribute(attributes.SCALE, i);
					instancedMesh.setMatrixAt(i, m.compose(p, q, s));
				}
				for (const attributeName in attributes) if (attributeName === "_COLOR_0") {
					const attr = attributes[attributeName];
					instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized);
				} else if (attributeName !== "TRANSLATION" && attributeName !== "ROTATION" && attributeName !== "SCALE") mesh.geometry.setAttribute(attributeName, attributes[attributeName]);
				Object3D.prototype.copy.call(instancedMesh, mesh);
				this.parser.assignFinalMaterial(instancedMesh);
				instancedMeshes.push(instancedMesh);
			}
			if (nodeObject.isGroup) {
				nodeObject.clear();
				nodeObject.add(...instancedMeshes);
				return nodeObject;
			}
			return instancedMeshes[0];
		});
	}
};
var BINARY_EXTENSION_HEADER_MAGIC = "glTF";
var BINARY_EXTENSION_HEADER_LENGTH = 12;
var BINARY_EXTENSION_CHUNK_TYPES = {
	JSON: 1313821514,
	BIN: 5130562
};
var GLTFBinaryExtension = class {
	constructor(data) {
		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;
		const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
		const textDecoder = new TextDecoder();
		this.header = {
			magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
			version: headerView.getUint32(4, true),
			length: headerView.getUint32(8, true)
		};
		if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
		else if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
		const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
		let chunkIndex = 0;
		while (chunkIndex < chunkContentsLength) {
			const chunkLength = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;
			const chunkType = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;
			if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
				const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
				this.content = textDecoder.decode(contentArray);
			} else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice(byteOffset, byteOffset + chunkLength);
			}
			chunkIndex += chunkLength;
		}
		if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.");
	}
};
var GLTFDracoMeshCompressionExtension = class {
	constructor(json, dracoLoader) {
		if (!dracoLoader) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();
	}
	decodePrimitive(primitive, parser) {
		const json = this.json;
		const dracoLoader = this.dracoLoader;
		const bufferViewIndex = primitive.extensions[this.name].bufferView;
		const gltfAttributeMap = primitive.extensions[this.name].attributes;
		const threeAttributeMap = {};
		const attributeNormalizedMap = {};
		const attributeTypeMap = {};
		for (const attributeName in gltfAttributeMap) {
			const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
			threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
		}
		for (const attributeName in primitive.attributes) {
			const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
			if (gltfAttributeMap[attributeName] !== void 0) {
				const accessorDef = json.accessors[primitive.attributes[attributeName]];
				attributeTypeMap[threeAttributeName] = WEBGL_COMPONENT_TYPES[accessorDef.componentType].name;
				attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
			}
		}
		return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
			return new Promise(function(resolve, reject) {
				dracoLoader.decodeDracoFile(bufferView, function(geometry) {
					for (const attributeName in geometry.attributes) {
						const attribute = geometry.attributes[attributeName];
						const normalized = attributeNormalizedMap[attributeName];
						if (normalized !== void 0) attribute.normalized = normalized;
					}
					resolve(geometry);
				}, threeAttributeMap, attributeTypeMap, LinearSRGBColorSpace, reject);
			});
		});
	}
};
var GLTFTextureTransformExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
	}
	extendTexture(texture, transform) {
		if ((transform.texCoord === void 0 || transform.texCoord === texture.channel) && transform.offset === void 0 && transform.rotation === void 0 && transform.scale === void 0) return texture;
		texture = texture.clone();
		if (transform.texCoord !== void 0) texture.channel = transform.texCoord;
		if (transform.offset !== void 0) texture.offset.fromArray(transform.offset);
		if (transform.rotation !== void 0) texture.rotation = transform.rotation;
		if (transform.scale !== void 0) texture.repeat.fromArray(transform.scale);
		texture.needsUpdate = true;
		return texture;
	}
};
var GLTFMeshQuantizationExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
	}
};
var GLTFCubicSplineInterpolant = class extends Interpolant {
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
	}
	copySampleValue_(index) {
		const result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
		for (let i = 0; i !== valueSize; i++) result[i] = values[offset + i];
		return result;
	}
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;
		const stride2 = stride * 2;
		const stride3 = stride * 3;
		const td = t1 - t0;
		const p = (t - t0) / td;
		const pp = p * p;
		const ppp = pp * p;
		const offset1 = i1 * stride3;
		const offset0 = offset1 - stride3;
		const s2 = -2 * ppp + 3 * pp;
		const s3 = ppp - pp;
		const s0 = 1 - s2;
		const s1 = s3 - pp + p;
		for (let i = 0; i !== stride; i++) {
			const p0 = values[offset0 + i + stride];
			const m0 = values[offset0 + i + stride2] * td;
			const p1 = values[offset1 + i + stride];
			const m1 = values[offset1 + i] * td;
			result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
		}
		return result;
	}
};
var _quaternion = new Quaternion();
var GLTFCubicSplineQuaternionInterpolant = class extends GLTFCubicSplineInterpolant {
	interpolate_(i1, t0, t, t1) {
		const result = super.interpolate_(i1, t0, t, t1);
		_quaternion.fromArray(result).normalize().toArray(result);
		return result;
	}
};
var WEBGL_CONSTANTS = {
	FLOAT: 5126,
	FLOAT_MAT3: 35675,
	FLOAT_MAT4: 35676,
	FLOAT_VEC2: 35664,
	FLOAT_VEC3: 35665,
	FLOAT_VEC4: 35666,
	LINEAR: 9729,
	REPEAT: 10497,
	SAMPLER_2D: 35678,
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
	UNSIGNED_BYTE: 5121,
	UNSIGNED_SHORT: 5123
};
var WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};
var WEBGL_FILTERS = {
	9728: NearestFilter,
	9729: LinearFilter,
	9984: NearestMipmapNearestFilter,
	9985: LinearMipmapNearestFilter,
	9986: NearestMipmapLinearFilter,
	9987: LinearMipmapLinearFilter
};
var WEBGL_WRAPPINGS = {
	33071: ClampToEdgeWrapping,
	33648: MirroredRepeatWrapping,
	10497: RepeatWrapping
};
var WEBGL_TYPE_SIZES = {
	"SCALAR": 1,
	"VEC2": 2,
	"VEC3": 3,
	"VEC4": 4,
	"MAT2": 4,
	"MAT3": 9,
	"MAT4": 16
};
var ATTRIBUTES = {
	POSITION: "position",
	NORMAL: "normal",
	TANGENT: "tangent",
	TEXCOORD_0: "uv",
	TEXCOORD_1: "uv1",
	TEXCOORD_2: "uv2",
	TEXCOORD_3: "uv3",
	COLOR_0: "color",
	WEIGHTS_0: "skinWeight",
	JOINTS_0: "skinIndex"
};
var PATH_PROPERTIES = {
	scale: "scale",
	translation: "position",
	rotation: "quaternion",
	weights: "morphTargetInfluences"
};
var INTERPOLATION = {
	CUBICSPLINE: void 0,
	LINEAR: InterpolateLinear,
	STEP: InterpolateDiscrete
};
var ALPHA_MODES = {
	OPAQUE: "OPAQUE",
	MASK: "MASK",
	BLEND: "BLEND"
};
function createDefaultMaterial(cache) {
	if (cache["DefaultMaterial"] === void 0) cache["DefaultMaterial"] = new MeshStandardMaterial({
		color: 16777215,
		emissive: 0,
		metalness: 1,
		roughness: 1,
		transparent: false,
		depthTest: true,
		side: FrontSide
	});
	return cache["DefaultMaterial"];
}
function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
	for (const name in objectDef.extensions) if (knownExtensions[name] === void 0) {
		object.userData.gltfExtensions = object.userData.gltfExtensions || {};
		object.userData.gltfExtensions[name] = objectDef.extensions[name];
	}
}
function assignExtrasToUserData(object, gltfDef) {
	if (gltfDef.extras !== void 0) {
		if (typeof gltfDef.extras === "object") Object.assign(object.userData, gltfDef.extras);
		else console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
	}
}
function addMorphTargets(geometry, targets, parser) {
	let hasMorphPosition = false;
	let hasMorphNormal = false;
	let hasMorphColor = false;
	for (let i = 0, il = targets.length; i < il; i++) {
		const target = targets[i];
		if (target.POSITION !== void 0) hasMorphPosition = true;
		if (target.NORMAL !== void 0) hasMorphNormal = true;
		if (target.COLOR_0 !== void 0) hasMorphColor = true;
		if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
	}
	if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry);
	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];
	const pendingColorAccessors = [];
	for (let i = 0, il = targets.length; i < il; i++) {
		const target = targets[i];
		if (hasMorphPosition) {
			const pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry.attributes.position;
			pendingPositionAccessors.push(pendingAccessor);
		}
		if (hasMorphNormal) {
			const pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry.attributes.normal;
			pendingNormalAccessors.push(pendingAccessor);
		}
		if (hasMorphColor) {
			const pendingAccessor = target.COLOR_0 !== void 0 ? parser.getDependency("accessor", target.COLOR_0) : geometry.attributes.color;
			pendingColorAccessors.push(pendingAccessor);
		}
	}
	return Promise.all([
		Promise.all(pendingPositionAccessors),
		Promise.all(pendingNormalAccessors),
		Promise.all(pendingColorAccessors)
	]).then(function(accessors) {
		const morphPositions = accessors[0];
		const morphNormals = accessors[1];
		const morphColors = accessors[2];
		if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
		if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
		if (hasMorphColor) geometry.morphAttributes.color = morphColors;
		geometry.morphTargetsRelative = true;
		return geometry;
	});
}
function updateMorphTargets(mesh, meshDef) {
	mesh.updateMorphTargets();
	if (meshDef.weights !== void 0) for (let i = 0, il = meshDef.weights.length; i < il; i++) mesh.morphTargetInfluences[i] = meshDef.weights[i];
	if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
		const targetNames = meshDef.extras.targetNames;
		if (mesh.morphTargetInfluences.length === targetNames.length) {
			mesh.morphTargetDictionary = {};
			for (let i = 0, il = targetNames.length; i < il; i++) mesh.morphTargetDictionary[targetNames[i]] = i;
		} else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
	}
}
function createPrimitiveKey(primitiveDef) {
	let geometryKey;
	const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
	if (dracoExtension) geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
	else geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
	if (primitiveDef.targets !== void 0) for (let i = 0, il = primitiveDef.targets.length; i < il; i++) geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
	return geometryKey;
}
function createAttributesKey(attributes) {
	let attributesKey = "";
	const keys = Object.keys(attributes).sort();
	for (let i = 0, il = keys.length; i < il; i++) attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
	return attributesKey;
}
function getNormalizedComponentScale(constructor) {
	switch (constructor) {
		case Int8Array: return 1 / 127;
		case Uint8Array: return 1 / 255;
		case Int16Array: return 1 / 32767;
		case Uint16Array: return 1 / 65535;
		default: throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
	}
}
function getImageURIMimeType(uri) {
	if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data\:image\/jpeg/) === 0) return "image/jpeg";
	if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0) return "image/webp";
	if (uri.search(/\.ktx2($|\?)/i) > 0 || uri.search(/^data\:image\/ktx2/) === 0) return "image/ktx2";
	return "image/png";
}
var _identityMatrix = new Matrix4();
var GLTFParser = class {
	constructor(json = {}, options = {}) {
		this.json = json;
		this.extensions = {};
		this.plugins = {};
		this.options = options;
		this.cache = new GLTFRegistry();
		this.associations = new Map();
		this.primitiveCache = {};
		this.nodeCache = {};
		this.meshCache = {
			refs: {},
			uses: {}
		};
		this.cameraCache = {
			refs: {},
			uses: {}
		};
		this.lightCache = {
			refs: {},
			uses: {}
		};
		this.sourceCache = {};
		this.textureCache = {};
		this.nodeNamesUsed = {};
		let isSafari = false;
		let safariVersion = -1;
		let isFirefox = false;
		let firefoxVersion = -1;
		if (typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined") {
			const userAgent = navigator.userAgent;
			isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
			const safariMatch = userAgent.match(/Version\/(\d+)/);
			safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;
			isFirefox = userAgent.indexOf("Firefox") > -1;
			firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;
		}
		if (typeof createImageBitmap === "undefined" || isSafari && safariVersion < 17 || isFirefox && firefoxVersion < 98) this.textureLoader = new TextureLoader(this.options.manager);
		else this.textureLoader = new ImageBitmapLoader(this.options.manager);
		this.textureLoader.setCrossOrigin(this.options.crossOrigin);
		this.textureLoader.setRequestHeader(this.options.requestHeader);
		this.fileLoader = new FileLoader(this.options.manager);
		this.fileLoader.setResponseType("arraybuffer");
		if (this.options.crossOrigin === "use-credentials") this.fileLoader.setWithCredentials(true);
	}
	setExtensions(extensions) {
		this.extensions = extensions;
	}
	setPlugins(plugins) {
		this.plugins = plugins;
	}
	parse(onLoad, onError) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		this.cache.removeAll();
		this.nodeCache = {};
		this._invokeAll(function(ext) {
			return ext._markDefs && ext._markDefs();
		});
		Promise.all(this._invokeAll(function(ext) {
			return ext.beforeRoot && ext.beforeRoot();
		})).then(function() {
			return Promise.all([
				parser.getDependencies("scene"),
				parser.getDependencies("animation"),
				parser.getDependencies("camera")
			]);
		}).then(function(dependencies) {
			const result = {
				scene: dependencies[0][json.scene || 0],
				scenes: dependencies[0],
				animations: dependencies[1],
				cameras: dependencies[2],
				asset: json.asset,
				parser,
				userData: {}
			};
			addUnknownExtensionsToUserData(extensions, result, json);
			assignExtrasToUserData(result, json);
			return Promise.all(parser._invokeAll(function(ext) {
				return ext.afterRoot && ext.afterRoot(result);
			})).then(function() {
				for (const scene of result.scenes) scene.updateMatrixWorld();
				onLoad(result);
			});
		}).catch(onError);
	}
	_markDefs() {
		const nodeDefs = this.json.nodes || [];
		const skinDefs = this.json.skins || [];
		const meshDefs = this.json.meshes || [];
		for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
			const joints = skinDefs[skinIndex].joints;
			for (let i = 0, il = joints.length; i < il; i++) nodeDefs[joints[i]].isBone = true;
		}
		for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
			const nodeDef = nodeDefs[nodeIndex];
			if (nodeDef.mesh !== void 0) {
				this._addNodeRef(this.meshCache, nodeDef.mesh);
				if (nodeDef.skin !== void 0) meshDefs[nodeDef.mesh].isSkinnedMesh = true;
			}
			if (nodeDef.camera !== void 0) this._addNodeRef(this.cameraCache, nodeDef.camera);
		}
	}
	_addNodeRef(cache, index) {
		if (index === void 0) return;
		if (cache.refs[index] === void 0) cache.refs[index] = cache.uses[index] = 0;
		cache.refs[index]++;
	}
	_getNodeRef(cache, index, object) {
		if (cache.refs[index] <= 1) return object;
		const ref = object.clone();
		const updateMappings = (original, clone) => {
			const mappings = this.associations.get(original);
			if (mappings != null) this.associations.set(clone, mappings);
			for (const [i, child] of original.children.entries()) updateMappings(child, clone.children[i]);
		};
		updateMappings(object, ref);
		ref.name += "_instance_" + cache.uses[index]++;
		return ref;
	}
	_invokeOne(func) {
		const extensions = Object.values(this.plugins);
		extensions.push(this);
		for (let i = 0; i < extensions.length; i++) {
			const result = func(extensions[i]);
			if (result) return result;
		}
		return null;
	}
	_invokeAll(func) {
		const extensions = Object.values(this.plugins);
		extensions.unshift(this);
		const pending = [];
		for (let i = 0; i < extensions.length; i++) {
			const result = func(extensions[i]);
			if (result) pending.push(result);
		}
		return pending;
	}
	getDependency(type, index) {
		const cacheKey = type + ":" + index;
		let dependency = this.cache.get(cacheKey);
		if (!dependency) {
			switch (type) {
				case "scene":
					dependency = this.loadScene(index);
					break;
				case "node":
					dependency = this._invokeOne(function(ext) {
						return ext.loadNode && ext.loadNode(index);
					});
					break;
				case "mesh":
					dependency = this._invokeOne(function(ext) {
						return ext.loadMesh && ext.loadMesh(index);
					});
					break;
				case "accessor":
					dependency = this.loadAccessor(index);
					break;
				case "bufferView":
					dependency = this._invokeOne(function(ext) {
						return ext.loadBufferView && ext.loadBufferView(index);
					});
					break;
				case "buffer":
					dependency = this.loadBuffer(index);
					break;
				case "material":
					dependency = this._invokeOne(function(ext) {
						return ext.loadMaterial && ext.loadMaterial(index);
					});
					break;
				case "texture":
					dependency = this._invokeOne(function(ext) {
						return ext.loadTexture && ext.loadTexture(index);
					});
					break;
				case "skin":
					dependency = this.loadSkin(index);
					break;
				case "animation":
					dependency = this._invokeOne(function(ext) {
						return ext.loadAnimation && ext.loadAnimation(index);
					});
					break;
				case "camera":
					dependency = this.loadCamera(index);
					break;
				default:
					dependency = this._invokeOne(function(ext) {
						return ext != this && ext.getDependency && ext.getDependency(type, index);
					});
					if (!dependency) throw new Error("Unknown type: " + type);
			}
			this.cache.add(cacheKey, dependency);
		}
		return dependency;
	}
	getDependencies(type) {
		let dependencies = this.cache.get(type);
		if (!dependencies) {
			const parser = this;
			const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
			dependencies = Promise.all(defs.map(function(def, index) {
				return parser.getDependency(type, index);
			}));
			this.cache.add(type, dependencies);
		}
		return dependencies;
	}
	loadBuffer(bufferIndex) {
		const bufferDef = this.json.buffers[bufferIndex];
		const loader = this.fileLoader;
		if (bufferDef.type && bufferDef.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
		if (bufferDef.uri === void 0 && bufferIndex === 0) return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
		const options = this.options;
		return new Promise(function(resolve, reject) {
			loader.load(LoaderUtils.resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
				reject(new Error("THREE.GLTFLoader: Failed to load buffer \"" + bufferDef.uri + "\"."));
			});
		});
	}
	loadBufferView(bufferViewIndex) {
		const bufferViewDef = this.json.bufferViews[bufferViewIndex];
		return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
			const byteLength = bufferViewDef.byteLength || 0;
			const byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice(byteOffset, byteOffset + byteLength);
		});
	}
	loadAccessor(accessorIndex) {
		const parser = this;
		const json = this.json;
		const accessorDef = this.json.accessors[accessorIndex];
		if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
			const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
			const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
			const normalized = accessorDef.normalized === true;
			const array = new TypedArray(accessorDef.count * itemSize);
			return Promise.resolve(new BufferAttribute(array, itemSize, normalized));
		}
		const pendingBufferViews = [];
		if (accessorDef.bufferView !== void 0) pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
		else pendingBufferViews.push(null);
		if (accessorDef.sparse !== void 0) {
			pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
			pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
		}
		return Promise.all(pendingBufferViews).then(function(bufferViews) {
			const bufferView = bufferViews[0];
			const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
			const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
			const elementBytes = TypedArray.BYTES_PER_ELEMENT;
			const itemBytes = elementBytes * itemSize;
			const byteOffset = accessorDef.byteOffset || 0;
			const byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
			const normalized = accessorDef.normalized === true;
			let array, bufferAttribute;
			if (byteStride && byteStride !== itemBytes) {
				const ibSlice = Math.floor(byteOffset / byteStride);
				const ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
				let ib = parser.cache.get(ibCacheKey);
				if (!ib) {
					array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
					ib = new InterleavedBuffer(array, byteStride / elementBytes);
					parser.cache.add(ibCacheKey, ib);
				}
				bufferAttribute = new InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
			} else {
				if (bufferView === null) array = new TypedArray(accessorDef.count * itemSize);
				else array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
				bufferAttribute = new BufferAttribute(array, itemSize, normalized);
			}
			if (accessorDef.sparse !== void 0) {
				const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
				const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
				const sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
				const sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
				if (bufferView !== null) bufferAttribute = new BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
				bufferAttribute.normalized = false;
				for (let i = 0, il = sparseIndices.length; i < il; i++) {
					const index = sparseIndices[i];
					bufferAttribute.setX(index, sparseValues[i * itemSize]);
					if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
					if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
					if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
					if (itemSize >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
				}
				bufferAttribute.normalized = normalized;
			}
			return bufferAttribute;
		});
	}
	loadTexture(textureIndex) {
		const json = this.json;
		const options = this.options;
		const sourceIndex = json.textures[textureIndex].source;
		const sourceDef = json.images[sourceIndex];
		let loader = this.textureLoader;
		if (sourceDef.uri) {
			const handler = options.manager.getHandler(sourceDef.uri);
			if (handler !== null) loader = handler;
		}
		return this.loadTextureImage(textureIndex, sourceIndex, loader);
	}
	loadTextureImage(textureIndex, sourceIndex, loader) {
		const parser = this;
		const json = this.json;
		const textureDef = json.textures[textureIndex];
		const sourceDef = json.images[sourceIndex];
		const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;
		if (this.textureCache[cacheKey]) return this.textureCache[cacheKey];
		const promise = this.loadImageSource(sourceIndex, loader).then(function(texture) {
			texture.flipY = false;
			texture.name = textureDef.name || sourceDef.name || "";
			if (texture.name === "" && typeof sourceDef.uri === "string" && sourceDef.uri.startsWith("data:image/") === false) texture.name = sourceDef.uri;
			const sampler = (json.samplers || {})[textureDef.sampler] || {};
			texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
			texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;
			texture.generateMipmaps = !texture.isCompressedTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
			parser.associations.set(texture, { textures: textureIndex });
			return texture;
		}).catch(function() {
			return null;
		});
		this.textureCache[cacheKey] = promise;
		return promise;
	}
	loadImageSource(sourceIndex, loader) {
		const parser = this;
		const json = this.json;
		const options = this.options;
		if (this.sourceCache[sourceIndex] !== void 0) return this.sourceCache[sourceIndex].then((texture) => texture.clone());
		const sourceDef = json.images[sourceIndex];
		const URL = self.URL || self.webkitURL;
		let sourceURI = sourceDef.uri || "";
		let isObjectURL = false;
		if (sourceDef.bufferView !== void 0) sourceURI = parser.getDependency("bufferView", sourceDef.bufferView).then(function(bufferView) {
			isObjectURL = true;
			const blob = new Blob([bufferView], { type: sourceDef.mimeType });
			sourceURI = URL.createObjectURL(blob);
			return sourceURI;
		});
		else if (sourceDef.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + sourceIndex + " is missing URI and bufferView");
		const promise = Promise.resolve(sourceURI).then(function(sourceURI) {
			return new Promise(function(resolve, reject) {
				let onLoad = resolve;
				if (loader.isImageBitmapLoader === true) onLoad = function(imageBitmap) {
					const texture = new Texture(imageBitmap);
					texture.needsUpdate = true;
					resolve(texture);
				};
				loader.load(LoaderUtils.resolveURL(sourceURI, options.path), onLoad, void 0, reject);
			});
		}).then(function(texture) {
			if (isObjectURL === true) URL.revokeObjectURL(sourceURI);
			assignExtrasToUserData(texture, sourceDef);
			texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);
			return texture;
		}).catch(function(error) {
			console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
			throw error;
		});
		this.sourceCache[sourceIndex] = promise;
		return promise;
	}
	assignTexture(materialParams, mapName, mapDef, colorSpace) {
		const parser = this;
		return this.getDependency("texture", mapDef.index).then(function(texture) {
			if (!texture) return null;
			if (mapDef.texCoord !== void 0 && mapDef.texCoord > 0) {
				texture = texture.clone();
				texture.channel = mapDef.texCoord;
			}
			if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
				const transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
				if (transform) {
					const gltfReference = parser.associations.get(texture);
					texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
					parser.associations.set(texture, gltfReference);
				}
			}
			if (colorSpace !== void 0) texture.colorSpace = colorSpace;
			materialParams[mapName] = texture;
			return texture;
		});
	}
	assignFinalMaterial(mesh) {
		const geometry = mesh.geometry;
		let material = mesh.material;
		const useDerivativeTangents = geometry.attributes.tangent === void 0;
		const useVertexColors = geometry.attributes.color !== void 0;
		const useFlatShading = geometry.attributes.normal === void 0;
		if (mesh.isPoints) {
			const cacheKey = "PointsMaterial:" + material.uuid;
			let pointsMaterial = this.cache.get(cacheKey);
			if (!pointsMaterial) {
				pointsMaterial = new PointsMaterial();
				Material.prototype.copy.call(pointsMaterial, material);
				pointsMaterial.color.copy(material.color);
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false;
				this.cache.add(cacheKey, pointsMaterial);
			}
			material = pointsMaterial;
		} else if (mesh.isLine) {
			const cacheKey = "LineBasicMaterial:" + material.uuid;
			let lineMaterial = this.cache.get(cacheKey);
			if (!lineMaterial) {
				lineMaterial = new LineBasicMaterial();
				Material.prototype.copy.call(lineMaterial, material);
				lineMaterial.color.copy(material.color);
				lineMaterial.map = material.map;
				this.cache.add(cacheKey, lineMaterial);
			}
			material = lineMaterial;
		}
		if (useDerivativeTangents || useVertexColors || useFlatShading) {
			let cacheKey = "ClonedMaterial:" + material.uuid + ":";
			if (useDerivativeTangents) cacheKey += "derivative-tangents:";
			if (useVertexColors) cacheKey += "vertex-colors:";
			if (useFlatShading) cacheKey += "flat-shading:";
			let cachedMaterial = this.cache.get(cacheKey);
			if (!cachedMaterial) {
				cachedMaterial = material.clone();
				if (useVertexColors) cachedMaterial.vertexColors = true;
				if (useFlatShading) cachedMaterial.flatShading = true;
				if (useDerivativeTangents) {
					if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
					if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= -1;
				}
				this.cache.add(cacheKey, cachedMaterial);
				this.associations.set(cachedMaterial, this.associations.get(material));
			}
			material = cachedMaterial;
		}
		mesh.material = material;
	}
	getMaterialType() {
		return MeshStandardMaterial;
	}
	loadMaterial(materialIndex) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const materialDef = json.materials[materialIndex];
		let materialType;
		const materialParams = {};
		const materialExtensions = materialDef.extensions || {};
		const pending = [];
		if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
			const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
			materialType = kmuExtension.getMaterialType();
			pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
		} else {
			const metallicRoughness = materialDef.pbrMetallicRoughness || {};
			materialParams.color = new Color(1, 1, 1);
			materialParams.opacity = 1;
			if (Array.isArray(metallicRoughness.baseColorFactor)) {
				const array = metallicRoughness.baseColorFactor;
				materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
				materialParams.opacity = array[3];
			}
			if (metallicRoughness.baseColorTexture !== void 0) pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
			materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
			materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
			if (metallicRoughness.metallicRoughnessTexture !== void 0) {
				pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
				pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
			}
			materialType = this._invokeOne(function(ext) {
				return ext.getMaterialType && ext.getMaterialType(materialIndex);
			});
			pending.push(Promise.all(this._invokeAll(function(ext) {
				return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
			})));
		}
		if (materialDef.doubleSided === true) materialParams.side = DoubleSide;
		const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
		if (alphaMode === ALPHA_MODES.BLEND) {
			materialParams.transparent = true;
			materialParams.depthWrite = false;
		} else {
			materialParams.transparent = false;
			if (alphaMode === ALPHA_MODES.MASK) materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : .5;
		}
		if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial) {
			pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
			materialParams.normalScale = new Vector2(1, 1);
			if (materialDef.normalTexture.scale !== void 0) {
				const scale = materialDef.normalTexture.scale;
				materialParams.normalScale.set(scale, scale);
			}
		}
		if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial) {
			pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
			if (materialDef.occlusionTexture.strength !== void 0) materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
		}
		if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
			const emissiveFactor = materialDef.emissiveFactor;
			materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);
		}
		if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture, SRGBColorSpace));
		return Promise.all(pending).then(function() {
			const material = new materialType(materialParams);
			if (materialDef.name) material.name = materialDef.name;
			assignExtrasToUserData(material, materialDef);
			parser.associations.set(material, { materials: materialIndex });
			if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
			return material;
		});
	}
	createUniqueName(originalName) {
		const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || "");
		if (sanitizedName in this.nodeNamesUsed) return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
		else {
			this.nodeNamesUsed[sanitizedName] = 0;
			return sanitizedName;
		}
	}
	loadGeometries(primitives) {
		const parser = this;
		const extensions = this.extensions;
		const cache = this.primitiveCache;
		function createDracoPrimitive(primitive) {
			return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function(geometry) {
				return addPrimitiveAttributes(geometry, primitive, parser);
			});
		}
		const pending = [];
		for (let i = 0, il = primitives.length; i < il; i++) {
			const primitive = primitives[i];
			const cacheKey = createPrimitiveKey(primitive);
			const cached = cache[cacheKey];
			if (cached) pending.push(cached.promise);
			else {
				let geometryPromise;
				if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) geometryPromise = createDracoPrimitive(primitive);
				else geometryPromise = addPrimitiveAttributes(new BufferGeometry(), primitive, parser);
				cache[cacheKey] = {
					primitive,
					promise: geometryPromise
				};
				pending.push(geometryPromise);
			}
		}
		return Promise.all(pending);
	}
	loadMesh(meshIndex) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const meshDef = json.meshes[meshIndex];
		const primitives = meshDef.primitives;
		const pending = [];
		for (let i = 0, il = primitives.length; i < il; i++) {
			const material = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
			pending.push(material);
		}
		pending.push(parser.loadGeometries(primitives));
		return Promise.all(pending).then(function(results) {
			const materials = results.slice(0, results.length - 1);
			const geometries = results[results.length - 1];
			const meshes = [];
			for (let i = 0, il = geometries.length; i < il; i++) {
				const geometry = geometries[i];
				const primitive = primitives[i];
				let mesh;
				const material = materials[i];
				if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
					mesh = meshDef.isSkinnedMesh === true ? new SkinnedMesh(geometry, material) : new Mesh(geometry, material);
					if (mesh.isSkinnedMesh === true) mesh.normalizeSkinWeights();
					if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode);
					else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode);
				} else if (primitive.mode === WEBGL_CONSTANTS.LINES) mesh = new LineSegments(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) mesh = new Line(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) mesh = new LineLoop(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.POINTS) mesh = new Points(geometry, material);
				else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
				if (Object.keys(mesh.geometry.morphAttributes).length > 0) updateMorphTargets(mesh, meshDef);
				mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
				assignExtrasToUserData(mesh, meshDef);
				if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);
				parser.assignFinalMaterial(mesh);
				meshes.push(mesh);
			}
			for (let i = 0, il = meshes.length; i < il; i++) parser.associations.set(meshes[i], {
				meshes: meshIndex,
				primitives: i
			});
			if (meshes.length === 1) {
				if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);
				return meshes[0];
			}
			const group = new Group();
			if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);
			parser.associations.set(group, { meshes: meshIndex });
			for (let i = 0, il = meshes.length; i < il; i++) group.add(meshes[i]);
			return group;
		});
	}
	loadCamera(cameraIndex) {
		let camera;
		const cameraDef = this.json.cameras[cameraIndex];
		const params = cameraDef[cameraDef.type];
		if (!params) {
			console.warn("THREE.GLTFLoader: Missing camera parameters.");
			return;
		}
		if (cameraDef.type === "perspective") camera = new PerspectiveCamera(MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
		else if (cameraDef.type === "orthographic") camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar);
		if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);
		assignExtrasToUserData(camera, cameraDef);
		return Promise.resolve(camera);
	}
	loadSkin(skinIndex) {
		const skinDef = this.json.skins[skinIndex];
		const pending = [];
		for (let i = 0, il = skinDef.joints.length; i < il; i++) pending.push(this._loadNodeShallow(skinDef.joints[i]));
		if (skinDef.inverseBindMatrices !== void 0) pending.push(this.getDependency("accessor", skinDef.inverseBindMatrices));
		else pending.push(null);
		return Promise.all(pending).then(function(results) {
			const inverseBindMatrices = results.pop();
			const jointNodes = results;
			const bones = [];
			const boneInverses = [];
			for (let i = 0, il = jointNodes.length; i < il; i++) {
				const jointNode = jointNodes[i];
				if (jointNode) {
					bones.push(jointNode);
					const mat = new Matrix4();
					if (inverseBindMatrices !== null) mat.fromArray(inverseBindMatrices.array, i * 16);
					boneInverses.push(mat);
				} else console.warn("THREE.GLTFLoader: Joint \"%s\" could not be found.", skinDef.joints[i]);
			}
			return new Skeleton(bones, boneInverses);
		});
	}
	loadAnimation(animationIndex) {
		const json = this.json;
		const parser = this;
		const animationDef = json.animations[animationIndex];
		const animationName = animationDef.name ? animationDef.name : "animation_" + animationIndex;
		const pendingNodes = [];
		const pendingInputAccessors = [];
		const pendingOutputAccessors = [];
		const pendingSamplers = [];
		const pendingTargets = [];
		for (let i = 0, il = animationDef.channels.length; i < il; i++) {
			const channel = animationDef.channels[i];
			const sampler = animationDef.samplers[channel.sampler];
			const target = channel.target;
			const name = target.node;
			const input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
			const output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
			if (target.node === void 0) continue;
			pendingNodes.push(this.getDependency("node", name));
			pendingInputAccessors.push(this.getDependency("accessor", input));
			pendingOutputAccessors.push(this.getDependency("accessor", output));
			pendingSamplers.push(sampler);
			pendingTargets.push(target);
		}
		return Promise.all([
			Promise.all(pendingNodes),
			Promise.all(pendingInputAccessors),
			Promise.all(pendingOutputAccessors),
			Promise.all(pendingSamplers),
			Promise.all(pendingTargets)
		]).then(function(dependencies) {
			const nodes = dependencies[0];
			const inputAccessors = dependencies[1];
			const outputAccessors = dependencies[2];
			const samplers = dependencies[3];
			const targets = dependencies[4];
			const tracks = [];
			for (let i = 0, il = nodes.length; i < il; i++) {
				const node = nodes[i];
				const inputAccessor = inputAccessors[i];
				const outputAccessor = outputAccessors[i];
				const sampler = samplers[i];
				const target = targets[i];
				if (node === void 0) continue;
				if (node.updateMatrix) node.updateMatrix();
				const createdTracks = parser._createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target);
				if (createdTracks) for (let k = 0; k < createdTracks.length; k++) tracks.push(createdTracks[k]);
			}
			const animation = new AnimationClip(animationName, void 0, tracks);
			assignExtrasToUserData(animation, animationDef);
			return animation;
		});
	}
	createNodeMesh(nodeIndex) {
		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[nodeIndex];
		if (nodeDef.mesh === void 0) return null;
		return parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
			const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
			if (nodeDef.weights !== void 0) node.traverse(function(o) {
				if (!o.isMesh) return;
				for (let i = 0, il = nodeDef.weights.length; i < il; i++) o.morphTargetInfluences[i] = nodeDef.weights[i];
			});
			return node;
		});
	}
	loadNode(nodeIndex) {
		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[nodeIndex];
		const nodePending = parser._loadNodeShallow(nodeIndex);
		const childPending = [];
		const childrenDef = nodeDef.children || [];
		for (let i = 0, il = childrenDef.length; i < il; i++) childPending.push(parser.getDependency("node", childrenDef[i]));
		const skeletonPending = nodeDef.skin === void 0 ? Promise.resolve(null) : parser.getDependency("skin", nodeDef.skin);
		return Promise.all([
			nodePending,
			Promise.all(childPending),
			skeletonPending
		]).then(function(results) {
			const node = results[0];
			const children = results[1];
			const skeleton = results[2];
			if (skeleton !== null) node.traverse(function(mesh) {
				if (!mesh.isSkinnedMesh) return;
				mesh.bind(skeleton, _identityMatrix);
			});
			for (let i = 0, il = children.length; i < il; i++) node.add(children[i]);
			if (node.userData.pivot !== void 0 && children.length > 0) {
				const pivot = node.userData.pivot;
				const pivotChild = children[0];
				node.pivot = new Vector3().fromArray(pivot);
				node.position.x -= pivot[0];
				node.position.y -= pivot[1];
				node.position.z -= pivot[2];
				pivotChild.position.set(0, 0, 0);
				delete node.userData.pivot;
			}
			return node;
		});
	}
	_loadNodeShallow(nodeIndex) {
		const json = this.json;
		const extensions = this.extensions;
		const parser = this;
		if (this.nodeCache[nodeIndex] !== void 0) return this.nodeCache[nodeIndex];
		const nodeDef = json.nodes[nodeIndex];
		const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
		const pending = [];
		const meshPromise = parser._invokeOne(function(ext) {
			return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
		});
		if (meshPromise) pending.push(meshPromise);
		if (nodeDef.camera !== void 0) pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera) {
			return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);
		}));
		parser._invokeAll(function(ext) {
			return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
		}).forEach(function(promise) {
			pending.push(promise);
		});
		this.nodeCache[nodeIndex] = Promise.all(pending).then(function(objects) {
			let node;
			if (nodeDef.isBone === true) node = new Bone();
			else if (objects.length > 1) node = new Group();
			else if (objects.length === 1) node = objects[0];
			else node = new Object3D();
			if (node !== objects[0]) for (let i = 0, il = objects.length; i < il; i++) node.add(objects[i]);
			if (nodeDef.name) {
				node.userData.name = nodeDef.name;
				node.name = nodeName;
			}
			assignExtrasToUserData(node, nodeDef);
			if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);
			if (nodeDef.matrix !== void 0) {
				const matrix = new Matrix4();
				matrix.fromArray(nodeDef.matrix);
				node.applyMatrix4(matrix);
			} else {
				if (nodeDef.translation !== void 0) node.position.fromArray(nodeDef.translation);
				if (nodeDef.rotation !== void 0) node.quaternion.fromArray(nodeDef.rotation);
				if (nodeDef.scale !== void 0) node.scale.fromArray(nodeDef.scale);
			}
			if (!parser.associations.has(node)) parser.associations.set(node, {});
			else if (nodeDef.mesh !== void 0 && parser.meshCache.refs[nodeDef.mesh] > 1) {
				const mapping = parser.associations.get(node);
				parser.associations.set(node, { ...mapping });
			}
			parser.associations.get(node).nodes = nodeIndex;
			return node;
		});
		return this.nodeCache[nodeIndex];
	}
	loadScene(sceneIndex) {
		const extensions = this.extensions;
		const sceneDef = this.json.scenes[sceneIndex];
		const parser = this;
		const scene = new Group();
		if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);
		assignExtrasToUserData(scene, sceneDef);
		if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);
		const nodeIds = sceneDef.nodes || [];
		const pending = [];
		for (let i = 0, il = nodeIds.length; i < il; i++) pending.push(parser.getDependency("node", nodeIds[i]));
		return Promise.all(pending).then(function(nodes) {
			for (let i = 0, il = nodes.length; i < il; i++) {
				const node = nodes[i];
				if (node.parent !== null) scene.add(clone(node));
				else scene.add(node);
			}
			const reduceAssociations = (node) => {
				const reducedAssociations = new Map();
				for (const [key, value] of parser.associations) if (key instanceof Material || key instanceof Texture) reducedAssociations.set(key, value);
				node.traverse((node) => {
					const mappings = parser.associations.get(node);
					if (mappings != null) reducedAssociations.set(node, mappings);
				});
				return reducedAssociations;
			};
			parser.associations = reduceAssociations(scene);
			return scene;
		});
	}
	_createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target) {
		const tracks = [];
		const targetName = node.name ? node.name : node.uuid;
		const targetNames = [];
		function collectMorphTargets(object) {
			if (object.morphTargetInfluences) targetNames.push(object.name ? object.name : object.uuid);
		}
		if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
			collectMorphTargets(node);
			if (node.isGroup) node.children.forEach(collectMorphTargets);
		} else targetNames.push(targetName);
		let TypedKeyframeTrack;
		switch (PATH_PROPERTIES[target.path]) {
			case PATH_PROPERTIES.weights:
				TypedKeyframeTrack = NumberKeyframeTrack;
				break;
			case PATH_PROPERTIES.rotation:
				TypedKeyframeTrack = QuaternionKeyframeTrack;
				break;
			case PATH_PROPERTIES.translation:
			case PATH_PROPERTIES.scale:
				TypedKeyframeTrack = VectorKeyframeTrack;
				break;
			default: switch (outputAccessor.itemSize) {
				case 1:
					TypedKeyframeTrack = NumberKeyframeTrack;
					break;
				default: TypedKeyframeTrack = VectorKeyframeTrack;
			}
		}
		const interpolation = sampler.interpolation !== void 0 ? INTERPOLATION[sampler.interpolation] : InterpolateLinear;
		const outputArray = this._getArrayFromAccessor(outputAccessor);
		for (let j = 0, jl = targetNames.length; j < jl; j++) {
			const track = new TypedKeyframeTrack(targetNames[j] + "." + PATH_PROPERTIES[target.path], inputAccessor.array, outputArray, interpolation);
			if (sampler.interpolation === "CUBICSPLINE") this._createCubicSplineTrackInterpolant(track);
			tracks.push(track);
		}
		return tracks;
	}
	_getArrayFromAccessor(accessor) {
		let outputArray = accessor.array;
		if (accessor.normalized) {
			const scale = getNormalizedComponentScale(outputArray.constructor);
			const scaled = new Float32Array(outputArray.length);
			for (let j = 0, jl = outputArray.length; j < jl; j++) scaled[j] = outputArray[j] * scale;
			outputArray = scaled;
		}
		return outputArray;
	}
	_createCubicSplineTrackInterpolant(track) {
		track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
			return new (this instanceof QuaternionKeyframeTrack ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant)(this.times, this.values, this.getValueSize() / 3, result);
		};
		track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
	}
};
function computeBounds(geometry, primitiveDef, parser) {
	const attributes = primitiveDef.attributes;
	const box = new Box3();
	if (attributes.POSITION !== void 0) {
		const accessor = parser.json.accessors[attributes.POSITION];
		const min = accessor.min;
		const max = accessor.max;
		if (min !== void 0 && max !== void 0) {
			box.set(new Vector3(min[0], min[1], min[2]), new Vector3(max[0], max[1], max[2]));
			if (accessor.normalized) {
				const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
				box.min.multiplyScalar(boxScale);
				box.max.multiplyScalar(boxScale);
			}
		} else {
			console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
			return;
		}
	} else return;
	const targets = primitiveDef.targets;
	if (targets !== void 0) {
		const maxDisplacement = new Vector3();
		const vector = new Vector3();
		for (let i = 0, il = targets.length; i < il; i++) {
			const target = targets[i];
			if (target.POSITION !== void 0) {
				const accessor = parser.json.accessors[target.POSITION];
				const min = accessor.min;
				const max = accessor.max;
				if (min !== void 0 && max !== void 0) {
					vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
					vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
					vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
					if (accessor.normalized) {
						const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
						vector.multiplyScalar(boxScale);
					}
					maxDisplacement.max(vector);
				} else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
			}
		}
		box.expandByVector(maxDisplacement);
	}
	geometry.boundingBox = box;
	const sphere = new Sphere();
	box.getCenter(sphere.center);
	sphere.radius = box.min.distanceTo(box.max) / 2;
	geometry.boundingSphere = sphere;
}
function addPrimitiveAttributes(geometry, primitiveDef, parser) {
	const attributes = primitiveDef.attributes;
	const pending = [];
	function assignAttributeAccessor(accessorIndex, attributeName) {
		return parser.getDependency("accessor", accessorIndex).then(function(accessor) {
			geometry.setAttribute(attributeName, accessor);
		});
	}
	for (const gltfAttributeName in attributes) {
		const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
		if (threeAttributeName in geometry.attributes) continue;
		pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
	}
	if (primitiveDef.indices !== void 0 && !geometry.index) {
		const accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor) {
			geometry.setIndex(accessor);
		});
		pending.push(accessor);
	}
	if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && "COLOR_0" in attributes) console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);
	assignExtrasToUserData(geometry, primitiveDef);
	computeBounds(geometry, primitiveDef, parser);
	return Promise.all(pending).then(function() {
		return primitiveDef.targets !== void 0 ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
	});
}
//#endregion
//#region node_modules/three/examples/jsm/libs/motion-controllers.module.js
var Constants = {
	Handedness: Object.freeze({
		NONE: "none",
		LEFT: "left",
		RIGHT: "right"
	}),
	ComponentState: Object.freeze({
		DEFAULT: "default",
		TOUCHED: "touched",
		PRESSED: "pressed"
	}),
	ComponentProperty: Object.freeze({
		BUTTON: "button",
		X_AXIS: "xAxis",
		Y_AXIS: "yAxis",
		STATE: "state"
	}),
	ComponentType: Object.freeze({
		TRIGGER: "trigger",
		SQUEEZE: "squeeze",
		TOUCHPAD: "touchpad",
		THUMBSTICK: "thumbstick",
		BUTTON: "button"
	}),
	ButtonTouchThreshold: .05,
	AxisTouchThreshold: .1,
	VisualResponseProperty: Object.freeze({
		TRANSFORM: "transform",
		VISIBILITY: "visibility"
	})
};
async function fetchJsonFile(path) {
	const response = await fetch(path);
	if (!response.ok) throw new Error(response.statusText);
	else return response.json();
}
async function fetchProfilesList(basePath) {
	if (!basePath) throw new Error("No basePath supplied");
	return await fetchJsonFile(`${basePath}/profilesList.json`);
}
async function fetchProfile(xrInputSource, basePath, defaultProfile = null, getAssetPath = true) {
	if (!xrInputSource) throw new Error("No xrInputSource supplied");
	if (!basePath) throw new Error("No basePath supplied");
	const supportedProfilesList = await fetchProfilesList(basePath);
	let match;
	xrInputSource.profiles.some((profileId) => {
		const supportedProfile = supportedProfilesList[profileId];
		if (supportedProfile) match = {
			profileId,
			profilePath: `${basePath}/${supportedProfile.path}`,
			deprecated: !!supportedProfile.deprecated
		};
		return !!match;
	});
	if (!match) {
		if (!defaultProfile) throw new Error("No matching profile name found");
		const supportedProfile = supportedProfilesList[defaultProfile];
		if (!supportedProfile) throw new Error(`No matching profile name found and default profile "${defaultProfile}" missing.`);
		match = {
			profileId: defaultProfile,
			profilePath: `${basePath}/${supportedProfile.path}`,
			deprecated: !!supportedProfile.deprecated
		};
	}
	const profile = await fetchJsonFile(match.profilePath);
	let assetPath;
	if (getAssetPath) {
		let layout;
		if (xrInputSource.handedness === "any") layout = profile.layouts[Object.keys(profile.layouts)[0]];
		else layout = profile.layouts[xrInputSource.handedness];
		if (!layout) throw new Error(`No matching handedness, ${xrInputSource.handedness}, in profile ${match.profileId}`);
		if (layout.assetPath) assetPath = match.profilePath.replace("profile.json", layout.assetPath);
	}
	return {
		profile,
		assetPath
	};
}
var defaultComponentValues = {
	xAxis: 0,
	yAxis: 0,
	button: 0,
	state: Constants.ComponentState.DEFAULT
};
function normalizeAxes(x = 0, y = 0) {
	let xAxis = x;
	let yAxis = y;
	if (Math.sqrt(x * x + y * y) > 1) {
		const theta = Math.atan2(y, x);
		xAxis = Math.cos(theta);
		yAxis = Math.sin(theta);
	}
	return {
		normalizedXAxis: xAxis * .5 + .5,
		normalizedYAxis: yAxis * .5 + .5
	};
}
var VisualResponse = class {
	constructor(visualResponseDescription) {
		this.componentProperty = visualResponseDescription.componentProperty;
		this.states = visualResponseDescription.states;
		this.valueNodeName = visualResponseDescription.valueNodeName;
		this.valueNodeProperty = visualResponseDescription.valueNodeProperty;
		if (this.valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
			this.minNodeName = visualResponseDescription.minNodeName;
			this.maxNodeName = visualResponseDescription.maxNodeName;
		}
		this.value = 0;
		this.updateFromComponent(defaultComponentValues);
	}
	updateFromComponent({ xAxis, yAxis, button, state }) {
		const { normalizedXAxis, normalizedYAxis } = normalizeAxes(xAxis, yAxis);
		switch (this.componentProperty) {
			case Constants.ComponentProperty.X_AXIS:
				this.value = this.states.includes(state) ? normalizedXAxis : .5;
				break;
			case Constants.ComponentProperty.Y_AXIS:
				this.value = this.states.includes(state) ? normalizedYAxis : .5;
				break;
			case Constants.ComponentProperty.BUTTON:
				this.value = this.states.includes(state) ? button : 0;
				break;
			case Constants.ComponentProperty.STATE:
				if (this.valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) this.value = this.states.includes(state);
				else this.value = this.states.includes(state) ? 1 : 0;
				break;
			default: throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`);
		}
	}
};
var Component = class {
	constructor(componentId, componentDescription) {
		if (!componentId || !componentDescription || !componentDescription.visualResponses || !componentDescription.gamepadIndices || Object.keys(componentDescription.gamepadIndices).length === 0) throw new Error("Invalid arguments supplied");
		this.id = componentId;
		this.type = componentDescription.type;
		this.rootNodeName = componentDescription.rootNodeName;
		this.touchPointNodeName = componentDescription.touchPointNodeName;
		this.visualResponses = {};
		Object.keys(componentDescription.visualResponses).forEach((responseName) => {
			const visualResponse = new VisualResponse(componentDescription.visualResponses[responseName]);
			this.visualResponses[responseName] = visualResponse;
		});
		this.gamepadIndices = Object.assign({}, componentDescription.gamepadIndices);
		this.values = {
			state: Constants.ComponentState.DEFAULT,
			button: this.gamepadIndices.button !== void 0 ? 0 : void 0,
			xAxis: this.gamepadIndices.xAxis !== void 0 ? 0 : void 0,
			yAxis: this.gamepadIndices.yAxis !== void 0 ? 0 : void 0
		};
	}
	get data() {
		return {
			id: this.id,
			...this.values
		};
	}
	updateFromGamepad(gamepad) {
		this.values.state = Constants.ComponentState.DEFAULT;
		if (this.gamepadIndices.button !== void 0 && gamepad.buttons.length > this.gamepadIndices.button) {
			const gamepadButton = gamepad.buttons[this.gamepadIndices.button];
			this.values.button = gamepadButton.value;
			this.values.button = this.values.button < 0 ? 0 : this.values.button;
			this.values.button = this.values.button > 1 ? 1 : this.values.button;
			if (gamepadButton.pressed || this.values.button === 1) this.values.state = Constants.ComponentState.PRESSED;
			else if (gamepadButton.touched || this.values.button > Constants.ButtonTouchThreshold) this.values.state = Constants.ComponentState.TOUCHED;
		}
		if (this.gamepadIndices.xAxis !== void 0 && gamepad.axes.length > this.gamepadIndices.xAxis) {
			this.values.xAxis = gamepad.axes[this.gamepadIndices.xAxis];
			this.values.xAxis = this.values.xAxis < -1 ? -1 : this.values.xAxis;
			this.values.xAxis = this.values.xAxis > 1 ? 1 : this.values.xAxis;
			if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.xAxis) > Constants.AxisTouchThreshold) this.values.state = Constants.ComponentState.TOUCHED;
		}
		if (this.gamepadIndices.yAxis !== void 0 && gamepad.axes.length > this.gamepadIndices.yAxis) {
			this.values.yAxis = gamepad.axes[this.gamepadIndices.yAxis];
			this.values.yAxis = this.values.yAxis < -1 ? -1 : this.values.yAxis;
			this.values.yAxis = this.values.yAxis > 1 ? 1 : this.values.yAxis;
			if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.yAxis) > Constants.AxisTouchThreshold) this.values.state = Constants.ComponentState.TOUCHED;
		}
		Object.values(this.visualResponses).forEach((visualResponse) => {
			visualResponse.updateFromComponent(this.values);
		});
	}
};
var MotionController = class {
	constructor(xrInputSource, profile, assetUrl) {
		if (!xrInputSource) throw new Error("No xrInputSource supplied");
		if (!profile) throw new Error("No profile supplied");
		this.xrInputSource = xrInputSource;
		this.assetUrl = assetUrl;
		this.id = profile.profileId;
		this.layoutDescription = profile.layouts[xrInputSource.handedness];
		this.components = {};
		Object.keys(this.layoutDescription.components).forEach((componentId) => {
			const componentDescription = this.layoutDescription.components[componentId];
			this.components[componentId] = new Component(componentId, componentDescription);
		});
		this.updateFromGamepad();
	}
	get gripSpace() {
		return this.xrInputSource.gripSpace;
	}
	get targetRaySpace() {
		return this.xrInputSource.targetRaySpace;
	}
	get data() {
		const data = [];
		Object.values(this.components).forEach((component) => {
			data.push(component.data);
		});
		return data;
	}
	updateFromGamepad() {
		Object.values(this.components).forEach((component) => {
			component.updateFromGamepad(this.xrInputSource.gamepad);
		});
	}
};
//#endregion
//#region node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js
var DEFAULT_PROFILES_PATH = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
var DEFAULT_PROFILE = "generic-trigger";
var XRControllerModel = class extends Object3D {
	constructor() {
		super();
		this.motionController = null;
		this.envMap = null;
	}
	setEnvironmentMap(envMap) {
		if (this.envMap == envMap) return this;
		this.envMap = envMap;
		this.traverse((child) => {
			if (child.isMesh) {
				child.material.envMap = this.envMap;
				child.material.needsUpdate = true;
			}
		});
		return this;
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		if (!this.motionController) return;
		this.motionController.updateFromGamepad();
		Object.values(this.motionController.components).forEach((component) => {
			Object.values(component.visualResponses).forEach((visualResponse) => {
				const { valueNode, minNode, maxNode, value, valueNodeProperty } = visualResponse;
				if (!valueNode) return;
				if (valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) valueNode.visible = value;
				else if (valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
					valueNode.quaternion.slerpQuaternions(minNode.quaternion, maxNode.quaternion, value);
					valueNode.position.lerpVectors(minNode.position, maxNode.position, value);
				}
			});
		});
	}
};
function findNodes(motionController, scene) {
	Object.values(motionController.components).forEach((component) => {
		const { type, touchPointNodeName, visualResponses } = component;
		if (type === Constants.ComponentType.TOUCHPAD) {
			component.touchPointNode = scene.getObjectByName(touchPointNodeName);
			if (component.touchPointNode) {
				const sphereGeometry = new SphereGeometry(.001);
				const material = new MeshBasicMaterial({ color: 255 });
				const sphere = new Mesh(sphereGeometry, material);
				component.touchPointNode.add(sphere);
			} else console.warn(`Could not find touch dot, ${component.touchPointNodeName}, in touchpad component ${component.id}`);
		}
		Object.values(visualResponses).forEach((visualResponse) => {
			const { valueNodeName, minNodeName, maxNodeName, valueNodeProperty } = visualResponse;
			if (valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
				visualResponse.minNode = scene.getObjectByName(minNodeName);
				visualResponse.maxNode = scene.getObjectByName(maxNodeName);
				if (!visualResponse.minNode) {
					console.warn(`Could not find ${minNodeName} in the model`);
					return;
				}
				if (!visualResponse.maxNode) {
					console.warn(`Could not find ${maxNodeName} in the model`);
					return;
				}
			}
			visualResponse.valueNode = scene.getObjectByName(valueNodeName);
			if (!visualResponse.valueNode) console.warn(`Could not find ${valueNodeName} in the model`);
		});
	});
}
function addAssetSceneToControllerModel(controllerModel, scene) {
	findNodes(controllerModel.motionController, scene);
	if (controllerModel.envMap) scene.traverse((child) => {
		if (child.isMesh) {
			child.material.envMap = controllerModel.envMap;
			child.material.needsUpdate = true;
		}
	});
	controllerModel.add(scene);
}
var XRControllerModelFactory = class {
	constructor(gltfLoader = null, onLoad = null) {
		this.gltfLoader = gltfLoader;
		this.path = DEFAULT_PROFILES_PATH;
		this._assetCache = {};
		this.onLoad = onLoad;
		if (!this.gltfLoader) this.gltfLoader = new GLTFLoader();
	}
	setPath(path) {
		this.path = path;
		return this;
	}
	createControllerModel(controller) {
		const controllerModel = new XRControllerModel();
		let scene = null;
		controller.addEventListener("connected", (event) => {
			const xrInputSource = event.data;
			if (xrInputSource.targetRayMode !== "tracked-pointer" || !xrInputSource.gamepad || xrInputSource.hand) return;
			fetchProfile(xrInputSource, this.path, DEFAULT_PROFILE).then(({ profile, assetPath }) => {
				controllerModel.motionController = new MotionController(xrInputSource, profile, assetPath);
				const cachedAsset = this._assetCache[controllerModel.motionController.assetUrl];
				if (cachedAsset) {
					scene = cachedAsset.scene.clone();
					addAssetSceneToControllerModel(controllerModel, scene);
					if (this.onLoad) this.onLoad(scene);
				} else {
					if (!this.gltfLoader) throw new Error("THREE.XRControllerModelFactory: GLTFLoader not set.");
					this.gltfLoader.setPath("");
					this.gltfLoader.load(controllerModel.motionController.assetUrl, (asset) => {
						this._assetCache[controllerModel.motionController.assetUrl] = asset;
						scene = asset.scene.clone();
						addAssetSceneToControllerModel(controllerModel, scene);
						if (this.onLoad) this.onLoad(scene);
					}, null, () => {
						throw new Error(`THREE.XRControllerModelFactory: Asset ${controllerModel.motionController.assetUrl} missing or malformed.`);
					});
				}
			}).catch((err) => {
				console.warn(err);
			});
		});
		controller.addEventListener("disconnected", () => {
			controllerModel.motionController = null;
			controllerModel.remove(scene);
			scene = null;
		});
		return controllerModel;
	}
};
//#endregion
//#region node_modules/three/examples/jsm/webxr/XRHandMeshModel.js
var DEFAULT_HAND_PROFILE_PATH = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/";
var XRHandMeshModel = class {
	constructor(handModel, controller, path, handedness, loader = null, onLoad = null, customCache = null) {
		this.controller = controller;
		this.handModel = handModel;
		this.bones = [];
		const pathToUse = path || DEFAULT_HAND_PROFILE_PATH;
		const processAsset = (gltf) => {
			const object = clone(gltf.scene.children[0]);
			this.handModel.add(object);
			const mesh = object.getObjectByProperty("type", "SkinnedMesh");
			mesh.frustumCulled = false;
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			[
				"wrist",
				"thumb-metacarpal",
				"thumb-phalanx-proximal",
				"thumb-phalanx-distal",
				"thumb-tip",
				"index-finger-metacarpal",
				"index-finger-phalanx-proximal",
				"index-finger-phalanx-intermediate",
				"index-finger-phalanx-distal",
				"index-finger-tip",
				"middle-finger-metacarpal",
				"middle-finger-phalanx-proximal",
				"middle-finger-phalanx-intermediate",
				"middle-finger-phalanx-distal",
				"middle-finger-tip",
				"ring-finger-metacarpal",
				"ring-finger-phalanx-proximal",
				"ring-finger-phalanx-intermediate",
				"ring-finger-phalanx-distal",
				"ring-finger-tip",
				"pinky-finger-metacarpal",
				"pinky-finger-phalanx-proximal",
				"pinky-finger-phalanx-intermediate",
				"pinky-finger-phalanx-distal",
				"pinky-finger-tip"
			].forEach((jointName) => {
				const bone = object.getObjectByName(jointName);
				if (bone !== void 0) bone.jointName = jointName;
				else console.warn(`Couldn't find ${jointName} in ${handedness} hand mesh`);
				this.bones.push(bone);
			});
			if (onLoad) onLoad(object);
		};
		const assetUrl = `${pathToUse}${handedness}.glb`;
		if (customCache && customCache[assetUrl]) processAsset(customCache[assetUrl]);
		else {
			if (loader === null) {
				loader = new GLTFLoader();
				loader.setPath(pathToUse);
			}
			loader.load(`${handedness}.glb`, (gltf) => {
				if (customCache) customCache[assetUrl] = gltf;
				processAsset(gltf);
			});
		}
	}
	updateMesh() {
		const XRJoints = this.controller.joints;
		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			if (bone) {
				const XRJoint = XRJoints[bone.jointName];
				if (XRJoint.visible) {
					const position = XRJoint.position;
					bone.position.copy(position);
					bone.quaternion.copy(XRJoint.quaternion);
				}
			}
		}
	}
};
//#endregion
//#region node_modules/three/examples/jsm/webxr/OculusHandModel.js
var TOUCH_RADIUS = .01;
var POINTING_JOINT = "index-finger-tip";
var OculusHandModel = class extends Object3D {
	constructor(controller, loader = null, onLoad = null) {
		super();
		this.controller = controller;
		this.motionController = null;
		this.envMap = null;
		this.loader = loader;
		this.onLoad = onLoad;
		this.path = null;
		this.mesh = null;
		controller.addEventListener("connected", (event) => {
			const xrInputSource = event.data;
			if (xrInputSource.hand && !this.motionController) {
				this.xrInputSource = xrInputSource;
				this.motionController = new XRHandMeshModel(this, controller, this.path, xrInputSource.handedness, this.loader, this.onLoad);
			}
		});
		controller.addEventListener("disconnected", () => {
			this.clear();
			this.motionController = null;
		});
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		if (this.motionController) this.motionController.updateMesh();
	}
	getPointerPosition() {
		const indexFingerTip = this.controller.joints[POINTING_JOINT];
		if (indexFingerTip) return indexFingerTip.position;
		else return null;
	}
	intersectBoxObject(boxObject) {
		const pointerPosition = this.getPointerPosition();
		if (pointerPosition) {
			const indexSphere = new Sphere(pointerPosition, TOUCH_RADIUS);
			const box = new Box3().setFromObject(boxObject);
			return indexSphere.intersectsBox(box);
		} else return false;
	}
	checkButton(button) {
		if (this.intersectBoxObject(button)) button.onPress();
		else button.onClear();
		if (button.isPressed()) button.whilePressed();
	}
};
//#endregion
//#region node_modules/three/examples/jsm/webxr/OculusHandPointerModel.js
var PINCH_THRESHOLD = .02;
var PINCH_MIN = .01;
var POINTER_ADVANCE_MAX = .02;
var POINTER_OPACITY_MAX = 1;
var POINTER_OPACITY_MIN = .4;
var POINTER_FRONT_RADIUS = .002;
var POINTER_REAR_RADIUS = .01;
var POINTER_REAR_RADIUS_MIN = .003;
var POINTER_LENGTH = .035;
var POINTER_SEGMENTS = 16;
var POINTER_RINGS = 12;
var POINTER_HEMISPHERE_ANGLE = 110;
var YAXIS = new Vector3(0, 1, 0);
var ZAXIS = new Vector3(0, 0, 1);
var CURSOR_RADIUS$2 = .02;
var CURSOR_MAX_DISTANCE$2 = 1.5;
var OculusHandPointerModel = class extends Object3D {
	constructor(hand, controller) {
		super();
		this.hand = hand;
		this.controller = controller;
		this.motionController = null;
		this.envMap = null;
		this.mesh = null;
		this.pointerGeometry = null;
		this.pointerMesh = null;
		this.pointerObject = null;
		this.pinched = false;
		this.attached = false;
		this.cursorObject = null;
		this.raycaster = null;
		this._onConnected = this._onConnected.bind(this);
		this._onDisconnected = this._onDisconnected.bind(this);
		this.hand.addEventListener("connected", this._onConnected);
		this.hand.addEventListener("disconnected", this._onDisconnected);
	}
	_onConnected(event) {
		const xrInputSource = event.data;
		if (xrInputSource.hand) {
			this.visible = true;
			this.xrInputSource = xrInputSource;
			this.createPointer();
		}
	}
	_onDisconnected() {
		this.visible = false;
		this.xrInputSource = null;
		if (this.pointerGeometry) this.pointerGeometry.dispose();
		if (this.pointerMesh && this.pointerMesh.material) this.pointerMesh.material.dispose();
		this.clear();
	}
	_drawVerticesRing(vertices, baseVector, ringIndex) {
		const segmentVector = baseVector.clone();
		for (let i = 0; i < POINTER_SEGMENTS; i++) {
			segmentVector.applyAxisAngle(ZAXIS, Math.PI * 2 / POINTER_SEGMENTS);
			const vid = ringIndex * POINTER_SEGMENTS + i;
			vertices[3 * vid] = segmentVector.x;
			vertices[3 * vid + 1] = segmentVector.y;
			vertices[3 * vid + 2] = segmentVector.z;
		}
	}
	_updatePointerVertices(rearRadius) {
		const vertices = this.pointerGeometry.attributes.position.array;
		const frontFaceBase = new Vector3(POINTER_FRONT_RADIUS, 0, -1 * (POINTER_LENGTH - rearRadius));
		this._drawVerticesRing(vertices, frontFaceBase, 0);
		const rearBase = new Vector3(Math.sin(Math.PI * POINTER_HEMISPHERE_ANGLE / 180) * rearRadius, Math.cos(Math.PI * POINTER_HEMISPHERE_ANGLE / 180) * rearRadius, 0);
		for (let i = 0; i < POINTER_RINGS; i++) {
			this._drawVerticesRing(vertices, rearBase, i + 1);
			rearBase.applyAxisAngle(YAXIS, Math.PI * POINTER_HEMISPHERE_ANGLE / 180 / -24);
		}
		const frontCenter = new Vector3(0, 0, -1 * (POINTER_LENGTH - rearRadius));
		vertices[624] = frontCenter.x;
		vertices[625] = frontCenter.y;
		vertices[626] = frontCenter.z;
		const rearCenter = new Vector3(0, 0, rearRadius);
		vertices[627] = rearCenter.x;
		vertices[628] = rearCenter.y;
		vertices[629] = rearCenter.z;
		this.pointerGeometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
	}
	createPointer() {
		let i, j;
		const vertices = new Array(630).fill(0);
		const indices = [];
		this.pointerGeometry = new BufferGeometry();
		this.pointerGeometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
		this._updatePointerVertices(POINTER_REAR_RADIUS);
		for (i = 0; i < POINTER_RINGS; i++) {
			for (j = 0; j < 15; j++) {
				indices.push(i * POINTER_SEGMENTS + j, i * POINTER_SEGMENTS + j + 1, (i + 1) * POINTER_SEGMENTS + j);
				indices.push(i * POINTER_SEGMENTS + j + 1, (i + 1) * POINTER_SEGMENTS + j + 1, (i + 1) * POINTER_SEGMENTS + j);
			}
			indices.push((i + 1) * POINTER_SEGMENTS - 1, i * POINTER_SEGMENTS, (i + 2) * POINTER_SEGMENTS - 1);
			indices.push(i * POINTER_SEGMENTS, (i + 1) * POINTER_SEGMENTS, (i + 2) * POINTER_SEGMENTS - 1);
		}
		const frontCenterIndex = 208;
		const rearCenterIndex = 209;
		for (i = 0; i < 15; i++) {
			indices.push(frontCenterIndex, i + 1, i);
			indices.push(rearCenterIndex, i + 192, i + 192 + 1);
		}
		indices.push(frontCenterIndex, 0, 15);
		indices.push(rearCenterIndex, 207, 192);
		const material = new MeshBasicMaterial();
		material.transparent = true;
		material.opacity = POINTER_OPACITY_MIN;
		this.pointerGeometry.setIndex(indices);
		this.pointerMesh = new Mesh(this.pointerGeometry, material);
		this.pointerMesh.position.set(0, 0, -1 * POINTER_REAR_RADIUS);
		this.pointerObject = new Object3D();
		this.pointerObject.add(this.pointerMesh);
		this.raycaster = new Raycaster();
		const cursorGeometry = new SphereGeometry(CURSOR_RADIUS$2, 10, 10);
		const cursorMaterial = new MeshBasicMaterial();
		cursorMaterial.transparent = true;
		cursorMaterial.opacity = POINTER_OPACITY_MIN;
		this.cursorObject = new Mesh(cursorGeometry, cursorMaterial);
		this.pointerObject.add(this.cursorObject);
		this.add(this.pointerObject);
	}
	_updateRaycaster() {
		if (this.raycaster) {
			const pointerMatrix = this.pointerObject.matrixWorld;
			const tempMatrix = new Matrix4();
			tempMatrix.identity().extractRotation(pointerMatrix);
			this.raycaster.ray.origin.setFromMatrixPosition(pointerMatrix);
			this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
		}
	}
	_updatePointer() {
		this.pointerObject.visible = this.controller.visible;
		const indexTip = this.hand.joints["index-finger-tip"];
		const thumbTip = this.hand.joints["thumb-tip"];
		const distance = indexTip.position.distanceTo(thumbTip.position);
		const position = indexTip.position.clone().add(thumbTip.position).multiplyScalar(.5);
		this.pointerObject.position.copy(position);
		this.pointerObject.quaternion.copy(this.controller.quaternion);
		this.pinched = distance <= PINCH_THRESHOLD;
		const pinchScale = (distance - PINCH_MIN) / .04;
		const focusScale = (distance - PINCH_MIN) / .01;
		if (pinchScale > 1) {
			this._updatePointerVertices(POINTER_REAR_RADIUS);
			this.pointerMesh.position.set(0, 0, -1 * POINTER_REAR_RADIUS);
			this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;
		} else if (pinchScale > 0) {
			const rearRadius = .007 * pinchScale + POINTER_REAR_RADIUS_MIN;
			this._updatePointerVertices(rearRadius);
			if (focusScale < 1) {
				this.pointerMesh.position.set(0, 0, -1 * rearRadius - (1 - focusScale) * POINTER_ADVANCE_MAX);
				this.pointerMesh.material.opacity = POINTER_OPACITY_MIN + (1 - focusScale) * .6;
			} else {
				this.pointerMesh.position.set(0, 0, -1 * rearRadius);
				this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;
			}
		} else {
			this._updatePointerVertices(POINTER_REAR_RADIUS_MIN);
			this.pointerMesh.position.set(0, 0, -1 * POINTER_REAR_RADIUS_MIN - POINTER_ADVANCE_MAX);
			this.pointerMesh.material.opacity = POINTER_OPACITY_MAX;
		}
		this.cursorObject.material.opacity = this.pointerMesh.material.opacity;
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		if (this.pointerGeometry) {
			this._updatePointer();
			this._updateRaycaster();
		}
	}
	isPinched() {
		return this.pinched;
	}
	setAttached(attached) {
		this.attached = attached;
	}
	isAttached() {
		return this.attached;
	}
	intersectObject(object, recursive = true) {
		if (this.raycaster) return this.raycaster.intersectObject(object, recursive);
	}
	intersectObjects(objects, recursive = true) {
		if (this.raycaster) return this.raycaster.intersectObjects(objects, recursive);
	}
	checkIntersections(objects, recursive = false) {
		if (this.raycaster && !this.attached) {
			const intersections = this.raycaster.intersectObjects(objects, recursive);
			const direction = new Vector3(0, 0, -1);
			if (intersections.length > 0) {
				const distance = intersections[0].distance;
				this.cursorObject.position.copy(direction.multiplyScalar(distance));
			} else this.cursorObject.position.copy(direction.multiplyScalar(CURSOR_MAX_DISTANCE$2));
		}
	}
	setCursor(distance) {
		const direction = new Vector3(0, 0, -1);
		if (this.raycaster && !this.attached) this.cursorObject.position.copy(direction.multiplyScalar(distance));
	}
	dispose() {
		this._onDisconnected();
		this.hand.removeEventListener("connected", this._onConnected);
		this.hand.removeEventListener("disconnected", this._onDisconnected);
	}
};
//#endregion
//#region src/webxr/GripPointerModel.js
var POINTER_COLOR$1 = 16777215;
var POINTER_ACTIVE_COLOR = 33275;
var POINTER_LINE_DISTANCE = 1;
var POINTER_LINE_WIDTH = 3;
var CURSOR_RADIUS$1 = .02;
var CURSOR_MAX_DISTANCE$1 = 1.5;
var GripPointerModel = class extends Object3D {
	constructor(controller, lineDistance = POINTER_LINE_DISTANCE, lineWidth = POINTER_LINE_WIDTH, lineColor = POINTER_COLOR$1, activeLineColor = POINTER_ACTIVE_COLOR, cursorDistance = CURSOR_MAX_DISTANCE$1, cursorRadius = CURSOR_RADIUS$1) {
		super();
		this._controller = controller;
		this._pointerObject = null;
		this._pointerLine = null;
		this._cursorObject = null;
		this._raycaster = null;
		this._lineColor = lineColor;
		this._activeLineColor = activeLineColor;
		this._lineDistance = lineDistance;
		this._lineWidth = lineWidth;
		this._cursorDistance = cursorDistance;
		this._cursorRadius = cursorRadius;
		this._onConnected = this._onConnected.bind(this);
		this._onDisconnected = this._onDisconnected.bind(this);
		this._controller.addEventListener("connected", this._onConnected);
		this._controller.addEventListener("disconnected", this._onDisconnected);
		this.createPointer();
	}
	set cursorColor(color) {
		if (this._cursorObject) this._cursorObject.material.color = new Color(color);
	}
	set lineDistance(distance) {
		if (this._pointerLine) {
			this._pointerLine.geometry.attributes.position.setZ(1, distance);
			this._pointerLine.geometry.attributes.position.needsUpdate = true;
		}
	}
	set lineColor(color) {
		if (this._pointerLine) {
			const pointerLine = this._pointerLine, lineColor = new Color(color);
			pointerLine.geometry.attributes.color.array[0] = lineColor.r;
			pointerLine.geometry.attributes.color.array[1] = lineColor.g;
			pointerLine.geometry.attributes.color.array[2] = lineColor.b;
			pointerLine.geometry.attributes.color.needsUpdate = true;
		}
	}
	set active(value) {
		this._active = value;
		this.lineColor = value ? this._activeLineColor : this._lineColor;
	}
	_onConnected(event) {
		const xrInputSource = event.data;
		if (!xrInputSource.hand) {
			this.visible = true;
			this.xrInputSource = xrInputSource;
			this.createPointer();
		}
	}
	_onDisconnected() {
		this.visible = false;
		this.xrInputSource = null;
		if (this._pointerLine && this._pointerLine.material) this._pointerLine.material.dispose();
		if (this._pointerLine && this._pointerLine.geometry) this._pointerLine.geometry.dispose();
		this.clear();
	}
	createPointer() {
		const lineMaterial = new LineBasicMaterial({
			vertexColors: true,
			blending: AdditiveBlending,
			linewidth: this._lineWidth
		}), pointerLine = this._pointerLine = new Line(new BufferGeometry(), lineMaterial), lineColor = new Color(POINTER_COLOR$1);
		pointerLine.geometry.setAttribute("position", new Float32BufferAttribute([
			0,
			0,
			0,
			0,
			0,
			-this._lineDistance
		], 3));
		pointerLine.geometry.setAttribute("color", new Float32BufferAttribute([
			lineColor.r,
			lineColor.g,
			lineColor.b,
			0,
			0,
			0
		], 3));
		pointerLine.name = "line";
		this._pointerObject = new Object3D();
		this._pointerObject.add(pointerLine);
		this._raycaster = new Raycaster();
		const cursorGeometry = new SphereGeometry(this._cursorRadius, 10, 10);
		const cursorMaterial = new MeshBasicMaterial({
			color: POINTER_COLOR$1,
			opacity: 1,
			transparent: true,
			depthTest: false
		});
		this._cursorObject = new Mesh(cursorGeometry, cursorMaterial);
		this._cursorObject.renderOrder = 100;
		this._pointerObject.add(this._cursorObject);
		this.setCursor(this._cursorDistance);
		this.add(this._pointerObject);
	}
	intersectObject(object, recursive = true) {
		if (this._raycaster) {
			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController(this._controller);
			return this._raycaster.intersectObject(object, recursive);
		}
	}
	intersectObjects(objects, recursive = true) {
		if (this._raycaster) {
			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController(this._controller);
			return this._raycaster.intersectObjects(objects, recursive);
		}
	}
	checkIntersections(objects, recursive = false) {
		if (this._raycaster) {
			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController(this._controller);
			const intersections = this._raycaster.intersectObjects(objects, recursive);
			const direction = new Vector3(0, 0, -1);
			if (intersections.length > 0) {
				const distance = intersections[0].distance;
				this._cursorObject.position.copy(direction.multiplyScalar(distance));
			} else this._cursorObject.position.copy(direction.multiplyScalar(CURSOR_MAX_DISTANCE$1));
		}
	}
	setCursor(distance) {
		const direction = new Vector3(0, 0, -1);
		if (this._raycaster) this._cursorObject.position.copy(direction.multiplyScalar(distance));
	}
	dispose() {
		this._onDisconnected();
		this._controller.removeEventListener("connected", this._onConnected);
		this._controller.removeEventListener("disconnected", this._onDisconnected);
	}
};
//#endregion
//#region src/webxr/GazePointerModel.js
var POINTER_COLOR = 16777215;
var CURSOR_RADIUS = .02;
var CURSOR_MAX_DISTANCE = 1.5;
var GazePointerModel = class extends Object3D {
	constructor(controller) {
		super();
		this.controller = controller;
		this.pointerObject = null;
		this.cursorObject = null;
		this.raycaster = null;
		this._onConnected = this._onConnected.bind(this);
		this._onDisconnected = this._onDisconnected.bind(this);
		this.controller.addEventListener("connected", this._onConnected);
		this.controller.addEventListener("disconnected", this._onDisconnected);
		this.createPointer();
	}
	set cursorColor(color) {
		if (this.cursorObject) this.cursorObject.material.color = new Color(color);
	}
	_onConnected(event) {
		const xrInputSource = event.data;
		if (!xrInputSource.hand) {
			this.visible = true;
			this.xrInputSource = xrInputSource;
			this.createPointer();
		}
	}
	_onDisconnected() {
		this.visible = false;
		this.xrInputSource = null;
		this.clear();
	}
	createPointer() {
		this.pointerObject = new Object3D();
		this.raycaster = new Raycaster();
		const cursorGeometry = new SphereGeometry(CURSOR_RADIUS, 10, 10);
		const cursorMaterial = new MeshBasicMaterial({
			color: POINTER_COLOR,
			opacity: 1,
			transparent: true,
			depthTest: false
		});
		this.cursorObject = new Mesh(cursorGeometry, cursorMaterial);
		this.pointerObject.add(this.cursorObject);
		this.add(this.pointerObject);
	}
	intersectObject(object, recursive = true) {
		if (this.raycaster) {
			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController(this.controller);
			return this.raycaster.intersectObject(object, recursive);
		}
	}
	intersectObjects(objects, recursive = true) {
		if (this.raycaster) {
			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController(this.controller);
			return this.raycaster.intersectObjects(objects, recursive);
		}
	}
	checkIntersections(objects, recursive = false) {
		if (this.raycaster) {
			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController(this.controller);
			const intersections = this.raycaster.intersectObjects(objects, recursive);
			const direction = new Vector3(0, 0, -1);
			if (intersections.length > 0) {
				const distance = intersections[0].distance;
				this.cursorObject.position.copy(direction.multiplyScalar(distance));
			} else this.cursorObject.position.copy(direction.multiplyScalar(CURSOR_MAX_DISTANCE));
		}
	}
	setCursor(distance) {
		const direction = new Vector3(0, 0, -1);
		if (this.raycaster) this.cursorObject.position.copy(direction.multiplyScalar(distance));
	}
	dispose() {
		this._onDisconnected();
		this.controller.removeEventListener("connected", this._onConnected);
		this.controller.removeEventListener("disconnected", this._onDisconnected);
	}
};
//#endregion
//#region src/webxr/XRGamepad.js
var XRGamepad = class extends EventDispatcher {
	constructor(controllerGrip) {
		super();
		this.previousButtonState = [];
		this.previousAxes = null;
		this._moveThreshold = .08;
		this._controllerGrip = controllerGrip;
		this._updateRef = (event) => this._update(event.data);
		this.enable = true;
	}
	set enable(value) {
		const controllerGrip = this._controllerGrip;
		controllerGrip.eventsEnabled = value;
		if (value) controllerGrip.addEventListener("gripUpdated", this._updateRef);
		else controllerGrip.removeEventListener("gripUpdated", this._updateRef);
	}
	set moveThreshold(threshold) {
		this._moveThreshold = threshold;
	}
	_update(inputSource) {
		const gamepad = inputSource.gamepad, buttons = gamepad.buttons, activeButton = buttons.filter((button) => button.pressed && button.value == 1)[0], activeIndex = buttons.indexOf(activeButton);
		if (activeButton && !this.previousButtonState[activeIndex]) {
			this.previousButtonState[activeIndex] = true;
			this.dispatchEvent({
				type: "pressed",
				button: activeButton,
				index: activeIndex
			});
			setTimeout(() => {
				this.previousButtonState[activeIndex] = false;
				this.dispatchEvent({
					type: "pressedend",
					button: activeButton,
					index: activeIndex
				});
			}, 300);
		}
		const currentAxes = gamepad.axes;
		if (this.previousAxes) {
			if (currentAxes.some((value, index) => Math.abs(value - this.previousAxes[index]) > this._moveThreshold)) this.dispatchEvent({
				type: "movechanged",
				axes: currentAxes
			});
		}
		this.previousAxes = currentAxes.slice();
	}
};
//#endregion
//#region src/webxr/XRIntersections.js
var XRIntersections = class extends EventDispatcher {
	constructor(controller, collisions = []) {
		super();
		this._controller = controller;
		this._collisions = [];
		this._defaultCursorDistance = 3.5;
		this._onControllerSelectRef = (event) => this._onControllerSelect(event);
		this._onControllerSelectEndRef = (event) => this._onControllerSelectEnd(event);
		this._onTransientPointerSelectEndRef = (event) => this._onTransientPointerSelectEnd(event);
		this._onIntersectionsRef = (event) => this._onIntersections(event);
		this.collisions = collisions;
		controller.addEventListener("connected", (event) => this._onControllerConnected(event));
	}
	set collisions(value) {
		this._collisions = value;
	}
	get intersections() {
		return this.currentPointer.intersectObjects(this._collisions, false);
	}
	get currentPointer() {
		return this._controller.userData.currentPointer;
	}
	set currentPointer(pointerModel) {
		this._controller.userData.currentPointer = pointerModel;
	}
	get selectedObject() {
		return this._controller.userData.selected;
	}
	set selectedObject(object) {
		return this._controller.userData.selected = object;
	}
	get hasHand() {
		return this._controller.userData.hasHand;
	}
	add(object) {
		this._collisions.push(object);
	}
	remove(object) {
		const index = this._collisions.indexOf(object);
		if (index > -1) this._collisions.splice(index, 1);
	}
	emit(eventName, object, point, distance) {
		this.dispatchEvent({
			type: eventName,
			intersectObject: object,
			intersectPoint: point,
			intersectDistance: distance
		});
	}
	_onControllerConnected(event) {
		const controller = event.target, data = event.data;
		this.dispose();
		switch (data.targetRayMode) {
			case "tracked-pointer":
				this.currentPointer = controller.userData.gripPointer;
				controller.addEventListener("selectstart", this._onControllerSelectRef);
				controller.addEventListener("selectend", this._onControllerSelectEndRef);
				break;
			case "gaze":
				this.currentPointer = controller.userData.gazePointer;
				controller.userData.isGaze = true;
				break;
			case "transient-pointer":
				this.currentPointer = controller.userData.gazePointer;
				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;
				controller.addEventListener("selectend", this._onTransientPointerSelectEndRef);
		}
		controller.addEventListener("move", this._onIntersectionsRef);
		if (this.hasHand) this.currentPointer = controller.userData.handPointer;
		else if (this._controller.userData.hand) {}
	}
	dispose() {
		const controller = this._controller;
		controller.removeEventListener("move", this._onIntersectionsRef);
		controller.removeEventListener("selectend", this.onTransientPointerSelectEndRef);
		controller.removeEventListener("selectstart", this._onControllerSelectRef);
		controller.removeEventListener("selectend", this._onControllerSelectEndRef);
	}
	intersectObject(object) {
		return this.currentPointer.intersectObject(object, false);
	}
	_onControllerSelect(event) {
		const controller = event.target, intersections = this.intersections;
		this.emitIntersections(controller, intersections);
	}
	_onControllerSelectEnd() {
		const object = this.selectedObject;
		if (object !== void 0) {
			this.emit("selectend", object);
			this.selectedObject = void 0;
			this.currentPointer.active = false;
		}
	}
	_onTransientPointerSelectEnd(event) {
		this._onControllerSelect(event);
		setTimeout(() => {
			this._onControllerSelectEnd(event);
			this.resetSelectedObject();
		}, 100);
	}
	emitIntersections(controller, intersections) {
		if (intersections.length > 0) {
			const intersection = intersections[0], object = intersection.object;
			this.selectedObject = object;
			if (object.visible) {
				this.currentPointer.active = true;
				this.emit("selected", object, intersection.point, intersection.distance);
			} else {
				this.currentPointer.active = false;
				this.dispatchEvent({
					type: "unselected",
					controller
				});
			}
		} else this.dispatchEvent({
			type: "unselected",
			controller
		});
	}
	_onIntersections(event) {
		const controller = event.target, intersections = this.intersections;
		if (intersections.length > 0) {
			if (controller.userData.selected != intersections[0].object) {
				const intersection = intersections[0], object = intersection.object;
				this.selectedObject = object;
				controller.userData.hitTime = performance.now() / 1e3;
				this.emit("hovered", object, intersection.point, intersection.distance);
				this.currentPointer.setCursor(intersection.distance);
			} else if (controller.visible && controller.userData.isGaze) {
				if (performance.now() / 1e3 - controller.userData.hitTime >= 2.5) {
					if (this.selectedObject.mesh.visible) {
						this.emit("selected", this.selectedObject);
						this.resetSelectedObject();
					}
				}
			}
		} else if (this.selectedObject) {
			this.currentPointer.setCursor(this._defaultCursorDistance);
			this.resetSelectedObject();
		}
		this.dispatchEvent({
			type: "move",
			controller
		});
	}
	resetSelectedObject() {
		const controller = this._controller;
		this.emit("hoverout", this.selectedObject);
		this.selectedObject = void 0;
		controller.userData.hitTime = 0;
		if (controller.userData.isGaze) this.currentPointer.setCursor(-1);
	}
};
//#endregion
//#region src/webxr/XRControllerManager.js
var XRControllerManager = class extends EventDispatcher {
	constructor(controllerIndex, scene, xrManager, collisions = [], useXRButtons = false, gripModelConfig = {}) {
		super();
		this._controllerIndex = controllerIndex;
		this._controller = xrManager.getController(controllerIndex);
		this._scene = scene;
		this._xrManager = xrManager;
		this._useXRButtons = useXRButtons;
		this._gripModelConfig = gripModelConfig;
		this._visible = true;
		this.index = 0;
		this._controller.addEventListener("connected", (event) => this._onControllerConnected(event));
		this._controller.addEventListener("disconnected", (event) => this._onControllerDisconnected(event));
		this._eventVisibleCallbackRef = (event) => {
			if (this.visible) this._eventCallbackRef(event);
		};
		this._eventCallbackRef = (event) => this.emit(event);
		this._xrIntersections = new XRIntersections(this._controller, collisions);
		this._xrIntersections.addEventListener("selected", this._eventVisibleCallbackRef);
		this._xrIntersections.addEventListener("unselected", this._eventCallbackRef);
		this._xrIntersections.addEventListener("selectend", this._eventVisibleCallbackRef);
		this._xrIntersections.addEventListener("hovered", this._eventVisibleCallbackRef);
		this._xrIntersections.addEventListener("hoverout", this._eventVisibleCallbackRef);
		this._xrIntersections.addEventListener("move", this._eventVisibleCallbackRef);
		scene.add(this._controller);
	}
	get controller() {
		return this._controller;
	}
	get isSelecting() {
		return !!this._xrIntersections.selectedObject;
	}
	get selectedObject() {
		return this._xrIntersections.selectedObject;
	}
	get hasHand() {
		return this._controller.userData.hasHand;
	}
	set hasHand(hand) {
		this._controller.userData.hasHand = hand;
	}
	get gripPointer() {
		return this._controller.userData.gripPointer;
	}
	get gazePointer() {
		return this._controller.userData.gazePointer;
	}
	get hand() {
		return this._controller.userData.hand;
	}
	get indexTip() {
		return this.hand.joints["index-finger-tip"];
	}
	get handPointer() {
		return this._controller.userData.handPointer;
	}
	get handModel() {
		return this._controller.userData.handModel;
	}
	get controllerGrip() {
		return this._controller.userData.controllerGrip;
	}
	get gripModel() {
		return this._controller.userData.gripModel;
	}
	get visible() {
		const controllerModel = this.gripModel || this.handModel;
		return controllerModel && controllerModel.visible || this._visible;
	}
	set visible(value) {
		this._visible = value;
		if (this.controllerGrip) {
			this.gripModel.visible = value;
			this.gripPointer.visible = value;
		}
		if (this.hand) {
			this.handModel.visible = value;
			this.handPointer.visible = value;
		}
		if (!value) this._xrIntersections.resetSelectedObject();
	}
	get controllerPosition() {
		return this._controller.position;
	}
	get controllerQuaternion() {
		return this._controller.quaternion;
	}
	set collisions(value) {
		this._xrIntersections.collisions = value;
	}
	addIntersect(object) {
		this._xrIntersections.add(object);
	}
	removeIntersect(object) {
		this._xrIntersections.remove(object);
	}
	setCursor(position) {
		this.currentPointer.setCursor(position);
	}
	isPinched() {
		return this.handPointer && this.handPointer.isPinched();
	}
	emit(event) {
		event.target = this;
		this.dispatchEvent(event);
	}
	_onControllerConnected(event) {
		const controller = event.target, data = event.data;
		if (controller.userData.isTransientPointer) {
			this.emit({
				type: "reconnected",
				controller: this._controller,
				data
			});
			return;
		}
		if (!controller.userData.controllerConnected) this.emit({
			type: "connected",
			controller,
			data
		});
		this.hasHand = !!data.hand;
		switch (data.targetRayMode) {
			case "tracked-pointer":
				if (!controller.userData.gripModel) {
					const controllerModelFactory = new XRControllerModelFactory(), controllerGrip = controller.userData.controllerGrip = this._xrManager.getControllerGrip(this._controllerIndex), gripModel = controller.userData.gripModel = controllerModelFactory.createControllerModel(controllerGrip);
					controllerGrip.add(gripModel);
					this._scene.add(controllerGrip);
					gripModel.visible = this._visible;
					this.emit({
						type: "controllerGrip",
						controllerGrip
					});
				}
				const gripPointer = controller.userData.gripPointer = new GripPointerModel(controller, this._gripModelConfig.lineDistance, this._gripModelConfig.lineWidth, this._gripModelConfig.lineColor, this._gripModelConfig.activeLineColor, this._gripModelConfig.cursorDistance, this._gripModelConfig.cursorRadius);
				controller.add(gripPointer);
				gripPointer.visible = this._visible;
				if (this.hasHand) {
					if (this._gripModelConfig.handPointerLine) gripPointer.children[0].remove(gripPointer._cursorObject);
					else controller.remove(gripPointer);
				}
				if (this._useXRButtons && !this.hasHand) {
					const xrGamepad = this._xrGamepad = controller.userData.xrGamePad = new XRGamepad(controller.userData.controllerGrip);
					xrGamepad.addEventListener("pressed", this._eventVisibleCallbackRef);
					xrGamepad.addEventListener("pressedend", this._eventVisibleCallbackRef);
					xrGamepad.addEventListener("movechanged", this._eventVisibleCallbackRef);
				}
				break;
			case "gaze":
				const gazePointer = controller.userData.gazePointer = new GazePointerModel(controller);
				controller.add(gazePointer);
				break;
			case "transient-pointer":
				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;
				const transientGazePointer = controller.userData.gazePointer = new GazePointerModel(controller);
				controller.add(transientGazePointer);
		}
		if (this.hasHand) {
			if (!controller.userData.hand) {
				const hand = controller.userData.hand = this._xrManager.getHand(this._controllerIndex), handModel = controller.userData.handModel = new OculusHandModel(hand);
				hand.add(handModel);
				handModel.visible = this._visible;
				const handPointer = controller.userData.handPointer = new OculusHandPointerModel(hand, controller);
				hand.add(handPointer);
				handPointer.visible = this._visible;
				hand.addEventListener("connected", (event) => {
					event.type = "hand-connected";
					this.emit(event);
				});
				hand.addEventListener("pinchstart", this._eventVisibleCallbackRef);
				hand.addEventListener("pinchend", this._eventVisibleCallbackRef);
				this._scene.add(hand);
				this.emit({
					type: "hand",
					hand
				});
			}
		} else if (controller.hand) this.emit({ type: "grip-reconnected" });
	}
	_onControllerDisconnected(event) {
		const controller = event.target;
		if (!controller.userData.isTransientPointer) controller.remove(controller.children[0]);
		if (this._xrGamepad) {
			this._xrGamepad.removeEventListener("pressed", this._eventVisibleCallbackRef);
			this._xrGamepad.removeEventListener("pressedend", this._eventVisibleCallbackRef);
			this._xrGamepad.removeEventListener("movechanged", this._eventVisibleCallbackRef);
			this._xrGamepad = null;
		}
	}
	dispose() {
		this._controller.dispatchEvent({ type: "disconnected " });
		if (this.hand) this._scene.remove(this.hand);
		if (this.controllerGrip) this._scene.remove(this.controllerGrip);
		this._scene.remove(this._controller);
	}
};
//#endregion
export { XRControllerManager, XRGamepad, XRIntersections };
