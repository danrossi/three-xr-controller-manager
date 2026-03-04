import { Object3D, Color, LineBasicMaterial, AdditiveBlending, Line, BufferGeometry, Float32BufferAttribute, Raycaster, SphereGeometry, MeshBasicMaterial, Mesh, Vector3, EventDispatcher } from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OculusHandModel } from 'three/addons/webxr/OculusHandModel.js';
import { OculusHandPointerModel } from 'three/addons/webxr/OculusHandPointerModel.js';

const POINTER_COLOR$1 = 0xffffff;
const POINTER_ACTIVE_COLOR = 0x0081FB;
const POINTER_LINE_DISTANCE = 1.0;
const POINTER_LINE_WIDTH = 3;

const CURSOR_RADIUS$1 = 0.02;
const CURSOR_MAX_DISTANCE$1 = 1.5;

/**
 * Represents a Grip pointer model.
 * Creates a cursor and line for a grip model.
 *
 * @augments Object3D
 * @three_import import { GripPointerModel } from 'three/addons/webxr/GripPointerModel.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
class GripPointerModel extends Object3D {

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
	constructor( controller,
		lineDistance = POINTER_LINE_DISTANCE,
		lineWidth = POINTER_LINE_WIDTH,
		lineColor = POINTER_COLOR$1,
		activeLineColor = POINTER_ACTIVE_COLOR,
		cursorDistance = CURSOR_MAX_DISTANCE$1,
		cursorRadius = CURSOR_RADIUS$1
	 ) {

		super();

		/**
		 * The WebXR controller in target ray space.
		 *
		 * @type {Group}
		 */
		this._controller = controller;

		/**
		 * The pointer object that holds the pointer mesh.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this._pointerObject = null;

		this._pointerLine = null;

		/**
		 * The cursor object.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this._cursorObject = null;

		/**
		 * The internal raycaster used for detecting
		 * intersections.
		 *
		 * @type {?Raycaster}
		 * @default null
		 */
		this._raycaster = null;

		this._lineColor = lineColor;
		this._activeLineColor = activeLineColor;
		this._lineDistance = lineDistance;
		this._lineWidth = lineWidth;
		this._cursorDistance = cursorDistance;
		this._cursorRadius = cursorRadius;

		this._onConnected = this._onConnected.bind( this );
		this._onDisconnected = this._onDisconnected.bind( this );
		this._controller.addEventListener( 'connected', this._onConnected );
		this._controller.addEventListener( 'disconnected', this._onDisconnected );

		this.createPointer();

	}

	/**
	 * Set the cursor color.
	 *
	 * @param {number} color - The color.
	 */
	set cursorColor( color ) {

		if ( this._cursorObject ) {

			this._cursorObject.material.color = new Color( color );

		}

	}

	/**
	 * Update the line distance.
	 *
	 * @param {number} distance - The line distance.
	 */
	set lineDistance( distance ) {

		if ( this._pointerLine ) {

			this._pointerLine.geometry.attributes.position.setZ( 1, distance );
			this._pointerLine.geometry.attributes.position.needsUpdate = true;

		}

	}

	/**
	 * Set the line color.
	 *
	 * @param {number} color = The line color.
	 */
	set lineColor( color ) {

		if ( this._pointerLine ) {

			const pointerLine = this._pointerLine,
				lineColor = new Color( color );
			pointerLine.geometry.attributes.color.array[ 0 ] = lineColor.r;
			pointerLine.geometry.attributes.color.array[ 1 ] = lineColor.g;
			pointerLine.geometry.attributes.color.array[ 2 ] = lineColor.b;
			pointerLine.geometry.attributes.color.needsUpdate = true;

		}

	}

	/**
	 * Set the pointer to active updating the line color to active.
	 *
	 * @param {boolean} value - Set active / inactive.
	 */
	set active( value ) {

		this._active = value;
		this.lineColor = value ? this._activeLineColor : this._lineColor;

	}

	/**
	 * On controller connected.
	 *
	 * @param {Object} event
	 */
	_onConnected( event ) {

		const xrInputSource = event.data;

		if ( ! xrInputSource.hand ) {

			this.visible = true;
			this.xrInputSource = xrInputSource;

			this.createPointer();

		}


	}

	/**
	 * On controller disconnected.
	 */
	_onDisconnected() {

		this.visible = false;
		this.xrInputSource = null;

		if ( this._pointerLine && this._pointerLine.material ) this._pointerLine.material.dispose();
		if ( this._pointerLine && this._pointerLine.geometry ) this._pointerLine.geometry.dispose();

		this.clear();

	}

	/**
	 * Creates a pointer mesh and adds it to this model.
	 */
	createPointer() {

		const lineMaterial = new LineBasicMaterial( {
				vertexColors: true,
				blending: AdditiveBlending,
				linewidth: this._lineWidth } ),
			pointerLine = this._pointerLine = new Line( new BufferGeometry(), lineMaterial ),
			lineColor = new Color( POINTER_COLOR$1 );
		pointerLine.geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - this._lineDistance ], 3 ) );
		pointerLine.geometry.setAttribute( 'color', new Float32BufferAttribute( [ lineColor.r, lineColor.g, lineColor.b, 0, 0, 0 ], 3 ) );

		pointerLine.name = 'line';
		//pointerLine.visible = false;

		this._pointerObject = new Object3D();
		this._pointerObject.add( pointerLine );

		this._raycaster = new Raycaster();


		// create cursor
		const cursorGeometry = new SphereGeometry( this._cursorRadius, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial( { color: POINTER_COLOR$1, opacity: 1, transparent: true, depthTest: false } );

		this._cursorObject = new Mesh( cursorGeometry, cursorMaterial );

		//set the render order on top.
		this._cursorObject.renderOrder = 100;

		this._pointerObject.add( this._cursorObject );

		this.setCursor( this._cursorDistance );

		this.add( this._pointerObject );

	}



	/**
	 * Performs an intersection test with the model's raycaster and the given object.
	 *
	 * @param {Object3D} object - The 3D object to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObject( object, recursive = true ) {

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );

			return this._raycaster.intersectObject( object, recursive );

		}

	}

	/**
	 * Performs an intersection test with the model's raycaster and the given objects.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObjects( objects, recursive = true ) {

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );

			return this._raycaster.intersectObjects( objects, recursive );

		}

	}

	/**
	 * Checks for intersections between the model's raycaster and the given objects. The method
	 * updates the cursor object to the intersection point.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=false] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 */
	checkIntersections( objects, recursive = false ) {

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );


			const intersections = this._raycaster.intersectObjects( objects, recursive );
			const direction = new Vector3( 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				this._cursorObject.position.copy( direction.multiplyScalar( distance ) );

			} else {

				this._cursorObject.position.copy( direction.multiplyScalar( CURSOR_MAX_DISTANCE$1 ) );

			}

		}

	}

	/**
	 * Sets the cursor to the given distance.
	 *
	 * @param {number} distance - The distance to set the cursor to.
	 */
	setCursor( distance ) {

		const direction = new Vector3( 0, 0, - 1 );
		if ( this._raycaster ) {

			this._cursorObject.position.copy( direction.multiplyScalar( distance ) );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._onDisconnected();
		this._controller.removeEventListener( 'connected', this._onConnected );
		this._controller.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

const POINTER_COLOR = 0xffffff;

const CURSOR_RADIUS = 0.02;
const CURSOR_MAX_DISTANCE = 1.5;

/**
 * Represents a Gaze pointer model.
 *
 * @augments Object3D
 * @three_import import { GazePointerModel } from 'three/addons/webxr/GazePointerModel.js';
 * @author Dan Rossi / http://github.com/danrossi
 */
class GazePointerModel extends Object3D {

	/**
	 * Constructs a new Gaze pointer model.
	 *
	 * @param {Group} controller - The WebXR controller in target ray space.
	 */
	constructor( controller ) {

		super();

		/**
		 * The WebXR controller in target ray space.
		 *
		 * @type {Group}
		 */
		this.controller = controller;

		/**
		 * The pointer object that holds the pointer mesh.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this.pointerObject = null;

		/**
		 * The cursor object.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this.cursorObject = null;

		/**
		 * The internal raycaster used for detecting
		 * intersections.
		 *
		 * @type {?Raycaster}
		 * @default null
		 */
		this.raycaster = null;

		this._onConnected = this._onConnected.bind( this );
		this._onDisconnected = this._onDisconnected.bind( this );
		this.controller.addEventListener( 'connected', this._onConnected );
		this.controller.addEventListener( 'disconnected', this._onDisconnected );

		this.createPointer();

	}

	/**
	 * Set the cursor color.
	 *
	 * @param {number} color - The color.
	 */
	set cursorColor( color ) {

		if ( this.cursorObject ) {

			this.cursorObject.material.color = new Color( color );

		}

	}

	_onConnected( event ) {

		const xrInputSource = event.data;
		if ( ! xrInputSource.hand ) {

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

	/**
	 * Creates a pointer mesh and adds it to this model.
	 */
	createPointer() {

		this.pointerObject = new Object3D();

		this.raycaster = new Raycaster();


		// create cursor
		const cursorGeometry = new SphereGeometry( CURSOR_RADIUS, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial( { color: POINTER_COLOR, opacity: 1, transparent: true, depthTest: false } );

		this.cursorObject = new Mesh( cursorGeometry, cursorMaterial );
		this.pointerObject.add( this.cursorObject );

		this.add( this.pointerObject );

	}



	/**
	 * Performs an intersection test with the model's raycaster and the given object.
	 *
	 * @param {Object3D} object - The 3D object to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObject( object, recursive = true ) {

		if ( this.raycaster ) {

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );

			return this.raycaster.intersectObject( object, recursive );

		}

	}

	/**
	 * Performs an intersection test with the model's raycaster and the given objects.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObjects( objects, recursive = true ) {

		if ( this.raycaster ) {

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );

			return this.raycaster.intersectObjects( objects, recursive );

		}

	}

	/**
	 * Checks for intersections between the model's raycaster and the given objects. The method
	 * updates the cursor object to the intersection point.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=false] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 */
	checkIntersections( objects, recursive = false ) {

		if ( this.raycaster ) {

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );


			const intersections = this.raycaster.intersectObjects( objects, recursive );
			const direction = new Vector3( 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

			} else {

				this.cursorObject.position.copy( direction.multiplyScalar( CURSOR_MAX_DISTANCE ) );

			}

		}

	}

	/**
	 * Sets the cursor to the given distance.
	 *
	 * @param {number} distance - The distance to set the cursor to.
	 */
	setCursor( distance ) {

		const direction = new Vector3( 0, 0, - 1 );
		if ( this.raycaster ) {

			this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._onDisconnected();
		this.controller.removeEventListener( 'connected', this._onConnected );
		this.controller.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

/**
 * This class provides gamepad input events from grip controller updates.
 * The events dispatched are pressed, pressedend and movechanged.
 * Button press and press end states are detected by the active state so they are only called once.
 * Move changes of the joystick are detected by a threshold.
 * The update callback can be enabled / disabled with a setter.
 *
 * @augments EventDispatcher
 * @three_import import { XRGamepad } from 'three/addons/webxr/XRGamepad.js';
 * @author Dan Rossi / http://github.com/danrossi
 */

class XRGamepad extends EventDispatcher {

	/**
     * Constructs a new XRGamepad
     *
     * @param {Group} controllerGrip - The controller grip space.
     */
	constructor( controllerGrip ) {

		super();

		/**
         * The current button state to prevent muitiple events called.
         *
         * @private
         * @type {Array}
         */
		this.previousButtonState = [];

		/**
         * Store the current axis data to detect movement changes.
         *
         * @private
         * @type {Array}
         */
		this.previousAxes = null;

		/**
         * The threshold to detect joystick movement changes.
         *
         * @private
         * @type {Number}
         */
		this._moveThreshold = 0.08;

		/**
         * The grip controller to get update events from.
         *
         * @private
         * @type {?Group}
         */
		this._controllerGrip = controllerGrip;

		/**
         * The grip update callback reference
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._updateRef = ( event ) => this._update( event.data );

		//initially set enabled
		this.enable = true;

	}

	/**
     * Enable / disable the grip controller updates.
     * @param {boolean} value
     */
	set enable( value ) {

		const controllerGrip = this._controllerGrip;

		controllerGrip.enableUpdate = value;
		if ( value ) {

			controllerGrip.addEventListener( 'update', this._updateRef );

		} else {

			controllerGrip.removeEventListener( 'update', this._updateRef );

		}

	}

	/**
     * Update the move change detection threshold.
     * @param {boolean} threshold
     */
	set moveThreshold( threshold ) {

		this._moveThreshold = threshold;

	}

	/**
     * Gamepad XR controller update method on connection
     * @param {XRInputSource} inputSource
     */
	_update( inputSource ) {

		const gamepad = inputSource.gamepad,
			buttons = gamepad.buttons,
			//is a button pressed with a value of 1
			activeButton = buttons.filter( button => button.pressed && button.value == 1 )[ 0 ],
			activeIndex = buttons.indexOf( activeButton );

		//check once if a button has been pressed and not set as its active for many frames
		if ( activeButton && ! this.previousButtonState[ activeIndex ] ) {

			//console.log("active ", activeButton, activeIndex);

			this.previousButtonState[ activeIndex ] = true;

			this.dispatchEvent( { type: 'pressed', button: activeButton, index: activeIndex } );

			//clear the pressed stated after 300ms when the gamepad button pressed stage changes
			setTimeout( () => {

				this.previousButtonState[ activeIndex ] = false;
				this.dispatchEvent( { type: 'pressedend', button: activeButton, index: activeIndex } );

			}, 300 );

		}

		const currentAxes = gamepad.axes;

		//check for joystick axes changes
		if ( this.previousAxes ) {

			//only update a move changed event if values of the axes changes within a threashold

			const hasChanged = currentAxes.some( ( value, index ) => Math.abs( value - this.previousAxes[ index ] ) > this._moveThreshold );

			if ( hasChanged ) {

				this.dispatchEvent( { type: 'movechanged', axes: currentAxes } );

			}

		}

		this.previousAxes = currentAxes.slice();

	}

}

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

class XRIntersections extends EventDispatcher {

	/**
	 * Constructs a new XRGamepad
	 *
	 * @param {Group} controller - The WebXR controller in target ray space.
     * @param {Array} collisions - The intersections collision list.
	 */

	constructor( controller, collisions = [] ) {

		super();

		/**
		 * The WebXR controller.
		 *
         * @private
		 * @type {Group}
		 */
		this._controller = controller;

		/**
         * The collection list
         *
         * @private
         * @type {?Array}
         */
		this._collisions = [];

		/**
         * The default cursor distance
         *
         * @private
         * @type {?Array}
         */
		this._defaultCursorDistance = 3.5;

		/**
         * The controller select callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onControllerSelectRef = ( event ) => this._onControllerSelect( event );

		/**
         * The controller select end callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onControllerSelectEndRef = ( event ) => this._onControllerSelectEnd( event );

		/**
         * The controller transient pointer specific select end callback reference.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onTransientPointerSelectEndRef = ( event ) => this._onTransientPointerSelectEnd( event );

		/**
         * The controller intersections on move events to capture hovering of objects.
         *
         * @private
         * @param {Object} event
         * @returns {void}
         */
		this._onIntersectionsRef = ( event ) => this._onIntersections( event );

		//set the collisions list
		this.collisions = collisions;

		controller.addEventListener( 'connected', ( event ) => this._onControllerConnected( event ) );

	}

	/**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
	set collisions( value ) {

		this._collisions = value;

	}

	/**
     * Get intersections on the current pointer model.
     * @returns {Array} - The detected intersections list.
     */
	get intersections() {

		return this.currentPointer.intersectObjects( this._collisions, false );

	}

	/**
     * Get the current pointer model;
     * @returns {Object3D} - The currently set pointer model.
     */
	get currentPointer() {

		return this._controller.userData.currentPointer;

	}

	/**
	 * Set the current pointer model
	 *
	 * @param {Object3D} pointerModel - The current pointer model
	 */
	set currentPointer( pointerModel ) {

		this._controller.userData.currentPointer = pointerModel;

	}

	/**
     * Get the selected object.
     * @param {Object} - The selected intersected object.
     */
	get selectedObject() {

		return this._controller.userData.selected;

	}

	/**
     * Set the selected intersected object.
     * @param {Object} object - The selected intersected object.
     */
	set selectedObject( object ) {

		return this._controller.userData.selected = object;

	}

	/**
     * If the currently connected controller has hand input.
     * @return {boolean}
     */
	get hasHand() {

		return this._controller.userData.hasHand;

	}

	/**
     * add object to intersection collision list.
     * @param {Object3D} object
     */
	add( object ) {

		this._collisions.push( object );

	}

	/**
     * remove object from intersection collision list.
     * @param {Object3D} object
     */
	remove( object ) {

		const index = this._collisions.indexOf( object );

		if ( index > - 1 ) {

			this._collisions.splice( index, 1 );

		}

	}

	/**
     *
     * @param {string} eventName - The event name.
     * @param {Object3D} object - The intersected object.
     * @param {Vector3} point  - The intersected object point.
	 * @param {number} distance - The intersected distance.
     */
	emit( eventName, object, point, distance ) {

		this.dispatchEvent( { type: eventName, intersectObject: object, intersectPoint: point, intersectDistance: distance } );

	}

	/**
     * Controller connected callback
     * @param {Object} event
     * @returns {void}
     */
	_onControllerConnected( event ) {

		const controller = event.target,
			data = event.data;

		this.dispose();


		switch ( data.targetRayMode ) {

			case 'tracked-pointer':

				//set the grip pointer as the current pointer.
				this.currentPointer = controller.userData.gripPointer;
				controller.addEventListener( 'selectstart', this._onControllerSelectRef );
				controller.addEventListener( 'selectend', this._onControllerSelectEndRef );

				break;
			case 'gaze':

				//set the gaze pointer as the current pointer.
				this.currentPointer = controller.userData.gazePointer;
				controller.userData.isGaze = true;

				break;
			case 'transient-pointer':
				//build the Apple Vision transient pointer controller
				//the controller is activated and deactivated between pinching and releasing a pinch
				this.currentPointer = controller.userData.gazePointer;

				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;

				//setup selection on selectend events.
				controller.addEventListener( 'selectend', this._onTransientPointerSelectEndRef );

				break;

		}

		//setup move events for intersection detection.
		controller.addEventListener( 'move', this._onIntersectionsRef );

		if ( this.hasHand ) {

			//hand controller
			this.currentPointer = controller.userData.handPointer;

		} else if ( this._controller.userData.hand ) ;

	}

	/**
	 * Dispose events.
	 */
	dispose() {

		const controller = this._controller;

		controller.removeEventListener( 'move', this._onIntersectionsRef );
		controller.removeEventListener( 'selectend', this.onTransientPointerSelectEndRef );
		controller.removeEventListener( 'selectstart', this._onControllerSelectRef );
		controller.removeEventListener( 'selectend', this._onControllerSelectEndRef );

	}

	/**
	 * Intersect single object on the current pointer model.
	 * @param {Object3D} object
	 * @return {Array} - intersections list.
	 */
	intersectObject( object ) {

		return this.currentPointer.intersectObject( object, false );

	}

	/**
     * Controller select event.
     * Get intersections from the current pointer and emit as selected.
     * @param {Object} event
     */
	_onControllerSelect( event ) {

		const controller = event.target,
			intersections = this.intersections;
		this.emitIntersections( controller, intersections );

	}

	/**
     * Controller select end event.
     * Resets the selected object.
     * Resets the active state of the current pointer.
     * @param {Object} event
     */
	_onControllerSelectEnd( ) {

		const object = this.selectedObject;

		if ( object !== undefined ) {

			this.emit( 'selectend', object );
			this.selectedObject = undefined;

			this.currentPointer.active = false;

		}


	}

	/**
     * on Transient pointer select end event.
     * @param {Object} event
     */
	_onTransientPointerSelectEnd( event ) {

		//Get and emit intersections
		this._onControllerSelect( event );

		setTimeout( () => {

			//Reset the selection.
			this._onControllerSelectEnd( event );
			this.resetSelectedObject();

		}, 100 );


	}

	/**
     * Emit a selection intersection.
     * On no intersection or if the object is hidden emit unselected.
     * @param {Group} controller = The WebXRController
     * @param {Array} intersections - The intersections list.
     */
	emitIntersections( controller, intersections ) {

		if ( intersections.length > 0 ) {

			const intersection = intersections[ 0 ],
				object = intersection.object;
			this.selectedObject = object;

			if ( object.visible ) {

				//set the current pointer active.
				//for GripPointer this will highlight the line.
				this.currentPointer.active = true;
				this.emit( 'selected', object, intersection.point, intersection.distance );

			} else {

				//reset the current pointer as active.
				this.currentPointer.active = false;
				this.dispatchEvent( { type: 'unselected', controller: controller } );

			}

		} else {

			this.dispatchEvent( { type: 'unselected', controller: controller } );

		}

	}

	/**
     * Get intersections on move events.
     * @param {Object} event
     */
	_onIntersections( event ) {

		const controller = event.target,
			//get the current intersections.
			intersections = this.intersections;

		if ( intersections.length > 0 ) {

			if ( controller.userData.selected != intersections[ 0 ].object ) {

				const intersection = intersections[ 0 ],
					object = intersection.object;
				this.selectedObject = object;
				controller.userData.hitTime = performance.now() / 1000;

				this.emit( 'hovered', object, intersection.point, intersection.distance );

				//update the pointer cursor to the intersection position.
				this.currentPointer.setCursor( intersection.distance );

			} else {

				//specific for gaze pointers. Emit selection after a delay.
				if ( controller.visible && controller.userData.isGaze ) {

					const elapsed = performance.now() / 1000,
						gazeTime = elapsed - controller.userData.hitTime;

					if ( gazeTime >= 2.5 ) {

						//console.log('selected', this.controller.userData.selected);
						if ( this.selectedObject.mesh.visible ) {

							this.emit( 'selected', this.selectedObject );
							this.resetSelectedObject();

						}

					}

				}

			}

		} else if ( this.selectedObject ) {

			this.currentPointer.setCursor( this._defaultCursorDistance );
			this.resetSelectedObject();

		}

		this.dispatchEvent( { type: 'move', controller: controller } );

	}

	/**
     * Reset the selected object and emit hoverout.
     */
	resetSelectedObject() {

		const controller = this._controller;

		this.emit( 'hoverout', this.selectedObject );
		this.selectedObject = undefined;
		controller.userData.hitTime = 0;
		if ( controller.userData.isGaze ) this.currentPointer.setCursor( - 1 );

	}

}

/**
 * This class provides a common XR controller manager for grip, hand, transient-pointer and gaze target ray controllers.
 * The events dispatched are selected, unselected, hovered, hoverout, pressed, pressedend and movechanged.
 * Sets up the grip, gaze and hand pointer models.
 *
 * @augments EventDispatcher
 * @three_import import { XRControllerManager } from 'three/addons/webxr/XRControllerManager.js';
 * @author Dan Rossi / http://github.com/danrossi
 */

class XRControllerManager extends EventDispatcher {

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
	constructor( controllerIndex, scene, xrManager, collisions = [], useXRButtons = false, gripModelConfig = {} ) {

		super();

		/**
         * The controller index.
         *
         * @private
         */
		this._controllerIndex = controllerIndex;


		/**
         * The WebXR controller in target ray space.
         *
		 * @private
		 * @type {Group}
         */
		this._controller = xrManager.getController( controllerIndex );

		/**
         * The scene object.
         *
		 * @private
		 * @type {Scene}
         */
		this._scene = scene;

		/**
         * The XR manager object.
		 *
         * @private
		 * @type {XRManager|WebXRManager}
         */
		this._xrManager = xrManager;

		/**
         * Enable gamepad button update events.
         *
         * @private
         * @type {Boolean}
         */
		this._useXRButtons = useXRButtons;

		this._gripModelConfig = gripModelConfig;

		/**
		 * Initial visibility of controller models.
		 * @private
		 * @type {Boolean}
		 */
		this._visible = true;

		//setup controller connext events.
		this._controller.addEventListener( 'connected', ( event ) => this._onControllerConnected( event ) );
		this._controller.addEventListener( 'disconnected', ( event ) => this._onControllerDisconnected( event ) );

		/**
         * The event emitter callback reference.
		 * Only emit when the controller is visible.
         *
         * @param {Object} event
         * @returns {void}
         */
		this._eventVisibleCallbackRef = ( event ) => {

			if ( this.visible ) this._eventCallbackRef( event );

		};

		/**
         * The unselected event emitter callback reference.
		 * Used for toggling the controller visibility and unsetting intersections.
         *
         * @param {Object} event
         * @returns {void}
         */
		this._eventCallbackRef = ( event ) => this.emit( event );

		/**
         * Create an XR intersections for this controller.
         * Provides a collision list.
         */
		this._xrIntersections = new XRIntersections( this._controller, collisions );

		this._xrIntersections.addEventListener( 'selected', this._eventVisibleCallbackRef );

		this._xrIntersections.addEventListener( 'unselected', this._eventCallbackRef );

		this._xrIntersections.addEventListener( 'selectend', this._eventVisibleCallbackRef );

		this._xrIntersections.addEventListener( 'hovered', this._eventVisibleCallbackRef );

		this._xrIntersections.addEventListener( 'hoverout', this._eventVisibleCallbackRef );

		this._xrIntersections.addEventListener( 'move', this._eventVisibleCallbackRef );

		scene.add( this._controller );


	}

	/**
    * The WebXR controller in target ray space.
    *
	* @returns {Group}
    */
	get controller() {

		return this._controller;

	}

	/**
	 * Is the intersection in a selecting state with a selected object.
	 *
	 * @returns {boolean}
	 */
	get isSelecting() {

		return !! this._xrIntersections.selectedObject;

	}

	/**
	 * The selected object.
	 *
	 * @returns {Object3D}
	 */
	get selectedObject() {

		return this._xrIntersections.selectedObject;

	}

	/**
     * If the currently connected controller has hand input.
     * @return {boolean}
     */
	get hasHand() {

		return this._controller.userData.hasHand;

	}

	/**
     * Set the controller has hand input.
     * @param {boolean} hand - Has hand input or not.
     */
	set hasHand( hand ) {

		this._controller.userData.hasHand = hand;

	}

	/**
     * Get the grip pointer model;
     * @returns {Object3D} - The grip pointer model.
     */
	get gripPointer() {

		return this._controller.userData.gripPointer;

	}

	/**
     * Get the gaze pointer model;
     * @returns {Object3D} - The gaze pointer model.
     */
	get gazePointer() {

		return this._controller.userData.gazePointer;

	}

	/**
	 * Get the hand controller.
	 *
	 * @returns {Object3D}
	 */
	get hand() {

		return this._controller.userData.hand;

	}

	/**
	 * Get the index tip joins of the hand object.
	 *
	 * @returns {Object3D}
	 */
	get indexTip() {

		return this.hand.joints[ 'index-finger-tip' ];

	}

	/**
     * Get the hand pointer model;
     * @returns {Object3D} - The hand pointer model.
     */
	get handPointer() {

		return this._controller.userData.handPointer;

	}

	/**
     * @returns {Object3D} - The hand controller model.
     */
	get handModel() {

		return this._controller.userData.handModel;

	}

	/**
     * @returns {Object3D} - The controller grip model.
     */
	get controllerGrip() {

		return this._controller.userData.controllerGrip;

	}

	/**
     * @returns {Object3D} - The grip controller model.
     */
	get gripModel() {

		return this._controller.userData.gripModel;

	}

	/**
	 * If the controller is visible
	 *
	 * @returns {boolean}
	 */
	get visible() {

		const controllerModel = ( this.gripModel || this.handModel );

		return controllerModel && controllerModel.visible || this._visible;

	}

	/**
	 * Set this controller and it's models as visible.
	 *
	 * @param {boolean} value - Set visible / hidden.
	 */
	set visible( value ) {

		this._visible = value;

		if ( this.controllerGrip ) {

			this.gripModel.visible = value;
			this.gripPointer.visible = value;

		}

		if ( this.hand ) {

			this.handModel.visible = value;
			this.handPointer.visible = value;

		}

		if ( ! value ) this._xrIntersections.resetSelectedObject();


	}

	/**
	 * Get the controller position
	 *
	 * @return {Vector3}
	 */
	get controllerPosition() {

		return this._controller.position;

	}

	/**
	 * Get the controller quartonion.
	 *
	 * @return {Vector3}
	 */
	get controllerQuaternion() {

		return this._controller.quaternion;

	}

	/**
     * Set the collisions list.
     *
     * @param {Array} value - The collisions list.
     */
	set collisions( value ) {

		this._xrIntersections.collisions = value;

	}

	/**
	 * Add object to intersection collisdion list.
	 *
	 * @param {Object3D} object
	 */
	addIntersect( object ) {

		this._xrIntersections.add( object );

	}

	/**
	 * Add object to intersection collisdion list.
	 *
	 * @param {Object3D} object
	 */
	removeIntersect( object ) {

		this._xrIntersections.remove( object );

	}

	/**
	 * Update the cursor positipn for the active pointer model.
	 * @param {number} position - The cursor position value.
	 */
	setCursor( position ) {

		this.currentPointer.setCursor( position );

	}

	/**
	 * If has hand pointer and is pinching.
	 * @returns {boolean}
	 */
	isPinched() {

		return this.handPointer && this.handPointer.isPinched();

	}

	/**
     *
     * @param {Object} event - The event object.
     */
	emit( event ) {

		event.target = this;
		this.dispatchEvent( event );

	}


	/**
     * The controller connected event.
     * @param {Object} event
     * @returns {void}
     */
	_onControllerConnected( event ) {

		const controller = event.target,
			data = event.data;

		//transient pointer is reconnecting.
		if ( controller.userData.isTransientPointer ) {

			this.emit( { type: 'reconnected', controller: this._controller, data: data } );
			return;

		}

		//only emit connected once
		if ( ! controller.userData.controllerConnected ) this.emit( { type: 'connected', controller: controller, data: data } );

		//has hand input
		this.hasHand = !! data.hand;

		switch ( data.targetRayMode ) {

			case 'tracked-pointer':

				if ( ! controller.userData.gripModel ) {

					const controllerModelFactory = new XRControllerModelFactory(),
						controllerGrip = controller.userData.controllerGrip = this._xrManager.getControllerGrip( this._controllerIndex ),
						gripModel = controller.userData.gripModel = controllerModelFactory.createControllerModel( controllerGrip );

					controllerGrip.add( gripModel );
					this._scene.add( controllerGrip );

					//set visibility the same as the controller
					gripModel.visible = this._visible;

					this.emit( { type: 'controllerGrip', controllerGrip: controllerGrip } );

				}

				const gripPointer = controller.userData.gripPointer = new GripPointerModel( controller,
					this._gripModelConfig.lineDistance,
					this._gripModelConfig.lineWidth,
					this._gripModelConfig.lineColor,
					this._gripModelConfig.activeLineColor,
					this._gripModelConfig.cursorDistance,
					this._gripModelConfig.cursorRadius
				);

				controller.add( gripPointer );

				gripPointer.visible = this._visible;

				//if has hand and use pointer line. disable the cursor or disable grip pointer.
				if ( this.hasHand ) {

					 if ( this._gripModelConfig.handPointerLine ) {

						gripPointer.children[ 0 ].remove( gripPointer._cursorObject );

					 } else {

						controller.remove( gripPointer );

					 }

				}

				//setup the gamepad controls events.
				if ( this._useXRButtons && ! this.hasHand ) {

					const xrGamepad = this._xrGamepad = controller.userData.xrGamePad = new XRGamepad( controller.userData.controllerGrip );

					xrGamepad.addEventListener( 'pressed', this._eventVisibleCallbackRef );
					xrGamepad.addEventListener( 'pressedend', this._eventVisibleCallbackRef );
					xrGamepad.addEventListener( 'movechanged', this._eventVisibleCallbackRef );

				}

				break;
			case 'gaze':

				const gazePointer = controller.userData.gazePointer = new GazePointerModel( controller );
				controller.add( gazePointer );

				break;
			case 'transient-pointer':
				//build the Apple Vision transient pointer controller
				//the controller is activated and deactivated between pinching and releasing a pinch
				controller.userData.isGaze = false;
				controller.userData.isTransientPointer = true;

				const transientGazePointer = controller.userData.gazePointer = new GazePointerModel( controller );
				controller.add( transientGazePointer );

				break;

		}

		//setup the hand model
		if ( this.hasHand ) {

			if ( ! controller.userData.hand ) {

				const hand = controller.userData.hand = this._xrManager.getHand( this._controllerIndex ),
					handModel = controller.userData.handModel = new OculusHandModel( hand );
				hand.add( handModel );

				//set visibility the same as the controller
				handModel.visible = this._visible;

				const handPointer = controller.userData.handPointer = new OculusHandPointerModel( hand, controller );
				hand.add( handPointer );

				handPointer.visible = this._visible;

				hand.addEventListener( 'connected', ( event ) => {

					event.type = 'hand-connected';
					this.emit( event );

				} );

				hand.addEventListener( 'pinchstart', this._eventVisibleCallbackRef );

				hand.addEventListener( 'pinchend', this._eventVisibleCallbackRef );

				this._scene.add( hand );

				this.emit( { type: 'hand', hand: hand } );

			}

		} else if ( controller.hand ) {

			//set back up grip controller
			this.emit( { type: 'grip-reconnected' } );

		}

	}

	_onControllerDisconnected( event ) {

		const controller = event.target;

		if ( ! controller.userData.isTransientPointer ) controller.remove( controller.children[ 0 ] );

		if ( this._xrGamepad ) {

			this._xrGamepad.removeEventListener( 'pressed', this._eventVisibleCallbackRef );
			this._xrGamepad.removeEventListener( 'pressedend', this._eventVisibleCallbackRef );
			this._xrGamepad.removeEventListener( 'movechanged', this._eventVisibleCallbackRef );
			this._xrGamepad = null;

		}

	}

}

export { XRControllerManager, XRGamepad, XRIntersections };
