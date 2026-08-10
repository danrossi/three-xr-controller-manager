import { Object3D, Mesh, Raycaster } from 'three';
/**
 * Represents a Gaze pointer model.
 *
 * @augments Object3D
 * @three_import import { GazePointerModel } from 'three/addons/webxr/GazePointerModel.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
export class GazePointerModel extends Object3D<import('three').Object3DEventMap> {
    /**
     * Constructs a new Gaze pointer model.
     *
     * @param {Group} controller - The WebXR controller in target ray space.
     */
    constructor(controller: Group);
    /**
     * The WebXR controller in target ray space.
     *
     * @type {Group}
     */
    controller: Group;
    /**
     * The pointer object that holds the pointer mesh.
     *
     * @type {?Object3D}
     * @default null
     */
    pointerObject: Object3D | null;
    /**
     * The cursor object.
     *
     * @type {?Mesh}
     * @default null
     */
    cursorObject: Mesh | null;
    /**
     * The internal raycaster used for detecting
     * intersections.
     *
     * @type {?Raycaster}
     * @default null
     */
    raycaster: Raycaster | null;
    _onConnected(event: any): void;
    _onDisconnected(): void;
    /**
     * Set the cursor color.
     *
     * @param {number} color - The color.
     */
    set cursorColor(color: number);
    xrInputSource: any;
    /**
     * Creates a pointer mesh and adds it to this model.
     */
    createPointer(): void;
    /**
     * Performs an intersection test with the model's raycaster and the given object.
     *
     * @param {Object3D} object - The 3D object to check for intersection with the ray.
     * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
     * Otherwise it only checks intersection with the object.
     * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
     */
    intersectObject(object: Object3D, recursive?: boolean): Array<Raycaster>;
    /**
     * Performs an intersection test with the model's raycaster and the given objects.
     *
     * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
     * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
     * Otherwise it only checks intersection with the object.
     * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
     */
    intersectObjects(objects: Array<Object3D>, recursive?: boolean): Array<Raycaster>;
    /**
     * Checks for intersections between the model's raycaster and the given objects. The method
     * updates the cursor object to the intersection point.
     *
     * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
     * @param {boolean} [recursive=false] - If set to `true`, it also checks all descendants.
     * Otherwise it only checks intersection with the object.
     */
    checkIntersections(objects: Array<Object3D>, recursive?: boolean): void;
    /**
     * Sets the cursor to the given distance.
     *
     * @param {number} distance - The distance to set the cursor to.
     */
    setCursor(distance: number): void;
    /**
     * Frees the GPU-related resources allocated by this instance. Call this
     * method whenever this instance is no longer used in your app.
     */
    dispose(): void;
}
