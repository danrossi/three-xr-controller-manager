import { Object3D, Group, BufferGeometry, LineBasicMaterial, Line, Mesh, Raycaster } from 'three';
/**
 * Represents a Grip pointer model.
 * Creates a cursor and line for a grip model.
 *
 * @augments Object3D
 * @three_import import { GripPointerModel } from 'three/addons/webxr/GripPointerModel.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
export class GripPointerModel extends Object3D<import('three').Object3DEventMap> {
    /**
     * Constructs a new Grip pointer model.
     *
     * @param {Group} controller - The WebXR controller in target ray space.
     * @param {number} lineDistance - The default line distance.
     * @param {mumber} lineWidth - The line width.
     * @param {number} lineColor = The default line color.
     * @param {number} activeLineColor = The active line color.
     * @param {number} cursorDistance = The default cursor distance.
     * @param {number} cursorRadius - The default cursor radius.
     */
    constructor(controller: Group, lineDistance?: number, lineWidth?: mumber, lineColor?: number, activeLineColor?: number, cursorDistance?: number, cursorRadius?: number);
    /**
     * The WebXR controller in target ray space.
     *
     * @type {Group}
     */
    _controller: Group;
    /**
     * The pointer object that holds the pointer mesh.
     *
     * @type {?Object3D}
     * @default null
     */
    _pointerObject: Object3D | null;
    _pointerLine: Line<BufferGeometry<import('three').NormalBufferAttributes, import('three').BufferGeometryEventMap>, LineBasicMaterial, import('three').Object3DEventMap> | null;
    /**
     * The cursor object.
     *
     * @type {?Mesh}
     * @default null
     */
    _cursorObject: Mesh | null;
    /**
     * The internal raycaster used for detecting
     * intersections.
     *
     * @type {?Raycaster}
     * @default null
     */
    _raycaster: Raycaster | null;
    _lineColor: number;
    _activeLineColor: number;
    _lineDistance: number;
    _lineWidth: mumber;
    _cursorDistance: number;
    _cursorRadius: number;
    /**
     * On controller connected.
     *
     * @param {Object} event
     */
    _onConnected(event: Object): void;
    /**
     * On controller disconnected.
     */
    _onDisconnected(): void;
    /**
     * Set the cursor color.
     *
     * @param {number} color - The color.
     */
    set cursorColor(color: number);
    /**
     * Update the line distance.
     *
     * @param {number} distance - The line distance.
     */
    set lineDistance(distance: number);
    /**
     * Set the line color.
     *
     * @param {number} color = The line color.
     */
    set lineColor(color: number);
    /**
     * Set the pointer to active updating the line color to active.
     *
     * @param {boolean} value - Set active / inactive.
     */
    set active(value: boolean);
    _active: boolean | undefined;
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
