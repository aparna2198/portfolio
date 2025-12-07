import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Not used in game loop currently but good to have
import * as CANNON from 'cannon-es';
import { createWorld, updateWorld } from './world.js';

// --- Setup ---
try {
    console.log("Starting Game Initialization");
    const canvas = document.querySelector('canvas.webgl');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog('#0f172a', 10, 50);

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Physics
    /*
    const physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0, -9.82, 0);
    physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
    physicsWorld.allowSleep = true;
    // Default material
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        { friction: 0.1, restitution: 0.7 }
    );
    physicsWorld.addContactMaterial(defaultContactMaterial);
    */
    const physicsWorld = null; // Mock
    const defaultMaterial = null; // Mock


    // --- World Content ---
    console.log("Creating World");
    const { objectsToUpdate, vehicle } = createWorld(scene, physicsWorld, defaultMaterial);
    console.log("World Created");


    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);


    // --- Utils ---
    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none'; // Force hide for debug


    // --- Game Loop ---
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - oldElapsedTime;
        oldElapsedTime = elapsedTime;

        // Update Physics
        // physicsWorld.step(1 / 60, deltaTime, 3);

        // Update Objects
        /*
        for (const object of objectsToUpdate) {
            object.mesh.position.copy(object.body.position);
            object.mesh.quaternion.copy(object.body.quaternion);
        }
        */

        // Update Vehicle
        // updateWorld(vehicle, keys);

        // Follow Camera
        /*
        if (vehicle && vehicle.chassisBody) {
            const chassisPosition = vehicle.chassisBody.position;
            // Smooth camera follow
            const goalPos = new THREE.Vector3(chassisPosition.x, chassisPosition.y + 10, chassisPosition.z + 10);
            camera.position.lerp(goalPos, 0.1);
            camera.lookAt(chassisPosition);
        }
        */

        // Render
        renderer.render(scene, camera);

        window.requestAnimationFrame(tick);
    };

    tick();
    console.log("Game Loop Started");

} catch (e) {
    console.error("Game Setup Error:", e);
    // document.body.innerHTML += `<div style="color:red; z-index:999">${e.message}</div>`; 
    // Handled by global error listener mostly, but let's ensure.
    throw e;
}
