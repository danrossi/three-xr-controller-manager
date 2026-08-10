import { EventDispatcher } from 'three';
/**
 * This class provides a common XR Intersections for grip, hand, transient-pointer and gaze target ray controllers.
 * The events dispatched are pressed, pressedend and movechanged.
 * Handles selection, selectend, hovered and hoverout events for each controller type.
 * Expects handPointer, gripPointer and gazePointer model setup to update the cursor and lines;
 *
 * @augments EventDispatcher
 * @three_import import { XRIntersections } from 'three/addons/webxr/XRIntersections.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
export class XRIntersections extends EventDispatcher<any> {
    /**
     * Constructs a new XRGamepad
     *
     * @param {Group} controller - The WebXR controller in target ray space.
     * @param {Array} collisions - The intersections collision list.
     */
    constructor(controller: Group, collisions?: any[]);
    /**
     * The WebXR controller.
     *
     * @private
     * @type {Group}
     */
    private _controller;
    /**
     * The collection list
     *
     * @private
     * @type {?Array}
     */
    private _collisions;
    /**
     * The default cursor distance
     *
     * @private
     * @type {?Array}
     */
    private _defaultCursorDistance;
    /**
     * The controller select callback reference.
     *
     * @private
     * @param {Object} event
     * @returns {void}
     */
    private _onControllerSelectRef;
    /**
     * The controller select end callback reference.
     *
     * @private
     * @param {Object} event
     * @returns {void}
     */
    private _onControllerSelectEndRef;
    /**
     * The controller transient pointer specific select end callback reference.
     *
     * @private
     * @param {Object} event
     * @returns {void}
     */
    private _onTransientPointerSelectEndRef;
    /**
     * The controller intersections on move events to capture hovering of objects.
     *
     * @private
     * @param {Object} event
     * @returns {void}
     */
    private _onIntersectionsRef;
    /**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
    set collisions(value: any[]);
    /**
     * Get intersections on the current pointer model.
     * @returns {Array} - The detected intersections list.
     */
    get intersections(): any[];
    /**
     * Set the current pointer model
     *
     * @param {Object3D} pointerModel - The current pointer model
     */
    set currentPointer(pointerModel: Object3D);
    /**
     * Get the current pointer model;
     * @returns {Object3D} - The currently set pointer model.
     */
    get currentPointer(): Object3D;
    /**
     * Set the selected intersected object.
     * @param {Object} object - The selected intersected object.
     */
    set selectedObject(object: Object);
    /**
     * Get the selected object.
     * @param {Object} - The selected intersected object.
     */
    get selectedObject(): Object;
    /**
     * If the currently connected controller has hand input.
     * @return {boolean}
     */
    get hasHand(): boolean;
    /**
     * add object to intersection collision list.
     * @param {Object3D} object
     */
    add(object: Object3D): void;
    /**
     * remove object from intersection collision list.
     * @param {Object3D} object
     */
    remove(object: Object3D): void;
    /**
     *
     * @param {string} eventName - The event name.
     * @param {Object3D} object - The intersected object.
     * @param {Vector3} point  - The intersected object point.
     * @param {number} distance - The intersected distance.
     */
    emit(eventName: string, object: Object3D, point: Vector3, distance: number): void;
    /**
     * Controller connected callback
     * @param {Object} event
     * @returns {void}
     */
    _onControllerConnected(event: Object): void;
    /**
     * Dispose events.
     */
    dispose(): void;
    /**
     * Intersect single object on the current pointer model.
     * @param {Object3D} object
     * @return {Array} - intersections list.
     */
    intersectObject(object: Object3D): any[];
    /**
     * Controller select event.
     * Get intersections from the current pointer and emit as selected.
     * @param {Object} event
     */
    _onControllerSelect(event: Object): void;
    /**
     * Controller select end event.
     * Resets the selected object.
     * Resets the active state of the current pointer.
     * @param {Object} event
     */
    _onControllerSelectEnd(): void;
    /**
     * on Transient pointer select end event.
     * @param {Object} event
     */
    _onTransientPointerSelectEnd(event: Object): void;
    /**
     * Emit a selection intersection.
     * On no intersection or if the object is hidden emit unselected.
     * @param {Group} controller = The WebXRController
     * @param {Array} intersections - The intersections list.
     */
    emitIntersections(controller: Group, intersections: any[]): void;
    /**
     * Get intersections on move events.
     * @param {Object} event
     */
    _onIntersections(event: Object): void;
    /**
     * Reset the selected object and emit hoverout.
     */
    resetSelectedObject(): void;
}
