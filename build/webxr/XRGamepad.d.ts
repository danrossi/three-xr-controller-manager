import { EventDispatcher } from 'three';
export class XRGamepad extends EventDispatcher<any> {
    /**
     * Constructs a new XRGamepad
     *
     * @param {Group} controllerGrip - The controller grip space.
     */
    constructor(controllerGrip: Group);
    /**
     * The current button state to prevent muitiple events called.
     *
     * @private
     * @type {Array}
     */
    private previousButtonState;
    /**
     * Store the current axis data to detect movement changes.
     *
     * @private
     * @type {Array}
     */
    private previousAxes;
    /**
     * The threshold to detect joystick movement changes.
     *
     * @private
     * @type {Number}
     */
    private _moveThreshold;
    /**
     * The grip controller to get update events from.
     *
     * @private
     * @type {?Group}
     */
    private _controllerGrip;
    /**
     * The grip update callback reference
     *
     * @private
     * @param {Object} event
     * @returns {void}
     */
    private _updateRef;
    /**
     * Enable / disable the grip controller updates.
     * @param {boolean} value
     */
    set enable(value: boolean);
    /**
     * Update the move change detection threshold.
     * @param {boolean} threshold
     */
    set moveThreshold(threshold: boolean);
    /**
     * Gamepad XR controller update method on connection
     * @param {XRInputSource} inputSource
     */
    _update(inputSource: XRInputSource): void;
}
