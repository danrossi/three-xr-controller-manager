import { EventDispatcher } from 'three';
import { XRIntersections } from './XRIntersections.js';
import { XRGamepad } from './XRGamepad.js';
/**
 * This class provides a common XR controller manager for grip, hand, transient-pointer and gaze target ray controllers.
 * The events dispatched are selected, unselected, hovered, hoverout, pressed, pressedend and movechanged.
 * Sets up the grip, gaze and hand pointer models.
 *
 * @augments EventDispatcher
 * @three_import import { XRControllerManager } from 'three/addons/webxr/XRControllerManager.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
export class XRControllerManager extends EventDispatcher<any> {
    /**
     * Constructs a new XRGamepad
     *
     * @param {number} controllerIndex = The controller index.
     * @param {Scene} scene - The scene object.
     * @param {XRManager|WebXRManager} xrManager - The webxr manager object.
     * @param {Array} collisions - The intersections collision list.
     * @param {boolean} useXRButtons - Enable gamepad controls update events.
     * @param {Object} gripModelConfig - Add configs for the grip model pointer.
     */
    constructor(controllerIndex: number, scene: Scene, xrManager: XRManager | WebXRManager, collisions?: any[], useXRButtons?: boolean, gripModelConfig?: Object);
    /**
     * The controller index.
     *
     * @private
     */
    private _controllerIndex;
    /**
     * The WebXR controller in target ray space.
     *
     * @private
     * @type {Group}
     */
    private _controller;
    /**
     * The scene object.
     *
     * @private
     * @type {Scene}
     */
    private _scene;
    /**
     * The XR manager object.
     *
     * @private
     * @type {XRManager|WebXRManager}
     */
    private _xrManager;
    /**
     * Enable gamepad button update events.
     *
     * @private
     * @type {Boolean}
     */
    private _useXRButtons;
    _gripModelConfig: Object;
    /**
     * Initial visibility of controller models.
     * @private
     * @type {Boolean}
     */
    private _visible;
    /**
     * The event emitter callback reference.
     * Only emit when the controller is visible.
     *
     * @param {Object} event
     * @returns {void}
     */
    _eventVisibleCallbackRef: (event: Object) => void;
    /**
     * The unselected event emitter callback reference.
     * Used for toggling the controller visibility and unsetting intersections.
     *
     * @param {Object} event
     * @returns {void}
     */
    _eventCallbackRef: (event: Object) => void;
    /**
     * Create an XR intersections for this controller.
     * Provides a collision list.
     */
    _xrIntersections: XRIntersections;
    /**
    * The WebXR controller in target ray space.
    *
    * @returns {Group}
    */
    get controller(): Group;
    /**
     * Is the intersection in a selecting state with a selected object.
     *
     * @returns {boolean}
     */
    get isSelecting(): boolean;
    /**
     * The selected object.
     *
     * @returns {Object3D}
     */
    get selectedObject(): Object3D;
    /**
     * Set the controller has hand input.
     * @param {boolean} hand - Has hand input or not.
     */
    set hasHand(hand: boolean);
    /**
     * If the currently connected controller has hand input.
     * @return {boolean}
     */
    get hasHand(): boolean;
    /**
     * Get the grip pointer model;
     * @returns {Object3D} - The grip pointer model.
     */
    get gripPointer(): Object3D;
    /**
     * Get the gaze pointer model;
     * @returns {Object3D} - The gaze pointer model.
     */
    get gazePointer(): Object3D;
    /**
     * Get the hand controller.
     *
     * @returns {Object3D}
     */
    get hand(): Object3D;
    /**
     * Get the index tip joins of the hand object.
     *
     * @returns {Object3D}
     */
    get indexTip(): Object3D;
    /**
     * Get the hand pointer model;
     * @returns {Object3D} - The hand pointer model.
     */
    get handPointer(): Object3D;
    /**
     * @returns {Object3D} - The hand controller model.
     */
    get handModel(): Object3D;
    /**
     * @returns {Object3D} - The controller grip model.
     */
    get controllerGrip(): Object3D;
    /**
     * @returns {Object3D} - The grip controller model.
     */
    get gripModel(): Object3D;
    /**
     * Set this controller and it's models as visible.
     *
     * @param {boolean} value - Set visible / hidden.
     */
    set visible(value: boolean);
    /**
     * If the controller is visible
     *
     * @returns {boolean}
     */
    get visible(): boolean;
    /**
     * Get the controller position
     *
     * @return {Vector3}
     */
    get controllerPosition(): Vector3;
    /**
     * Get the controller quartonion.
     *
     * @return {Vector3}
     */
    get controllerQuaternion(): Vector3;
    /**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
    set collisions(value: any[]);
    /**
     * Add object to intersection collisdion list.
     *
     * @param {Object3D} object
     */
    addIntersect(object: Object3D): void;
    /**
     * Add object to intersection collisdion list.
     *
     * @param {Object3D} object
     */
    removeIntersect(object: Object3D): void;
    /**
     * Update the cursor positipn for the active pointer model.
     * @param {number} position - The cursor position value.
     */
    setCursor(position: number): void;
    /**
     * If has hand pointer and is pinching.
     * @returns {boolean}
     */
    isPinched(): boolean;
    /**
     *
     * @param {Object} event - The event object.
     */
    emit(event: Object): void;
    /**
     * The controller connected event.
     * @param {Object} event
     * @returns {void}
     */
    _onControllerConnected(event: Object): void;
    _xrGamepad: XRGamepad | null | undefined;
    _onControllerDisconnected(event: any): void;
}
