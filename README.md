# Custom XRController Manager for three.js

A dual WebXR controller manager for three.js with intersection and gamepad support.

Handling dual XR controllers is clunky this manager handles both internally with events provided to handle controller activity.

## Usage

```
import { XRControllerManager } from 'three-xr-controller-manager';


const events = [
    'connected',
    'disconnected',
    'reconnected',
    'selected',
    'unselected',
    'selectend',
    'hovered',
    'hoverout',
    //'move',
    'pressed',
    'pressedend',
    'movechanged',
    'hand-connected',
    'pinchstart',
    'pinchend',
    'grip-reconnected'
];

[0, 1].forEach((index) => {

    const controller = new XRControllerManager(index, scene, renderer.xr, room.children, true, {
        handPointerLine: false
    });

    //controller.visible = false;

    events.forEach(eventName => {

        controller.addEventListener(eventName, (event) => {

            console.log(event.type, event);

        });

    });

    controller.addEventListener('selected', (event) => {

        selectedController = controller;

        console.log(event);

    });

    controller.addEventListener('unselected', () => {

        selectedController = null;

    });

    controller.addEventListener('selectend', (event) => {

        selectedController = null;

        console.log(event);

    });

    controller.addEventListener('hovered', (event) => {

        if (INTERSECTED != event.intersectObject) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            //the current intersectObject
            INTERSECTED = event.intersectObject;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

        }

    });

    controller.addEventListener('hoverout', () => {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = undefined;

    });

    controllers.set(index, controller);

});
```