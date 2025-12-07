import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'; // Disabled for now
// import { FontLoader } from 'three/addons/loaders/FontLoader.js'; // Disabled for now

export const objectsToUpdate = [];
let font = null;

// Load Font
/*
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
});
*/

export function createWorld(scene, physicsWorld, defaultMaterial) {
    // Debug Box to prove scene renders
    console.log("Creating Debug Box");
    const debugGeometry = new THREE.BoxGeometry(2, 2, 2);
    const debugMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);
    debugMesh.position.set(0, 0, 0); // At center
    scene.add(debugMesh);

    // const vehicle = createVehicle(scene, physicsWorld, defaultMaterial);
    // createFloor(scene, physicsWorld, defaultMaterial);
    // createEnvironment(scene, physicsWorld, defaultMaterial); // Temporarily disable to isolate issues

    return { objectsToUpdate: [], vehicle: null };
}

function createFloor(scene, physicsWorld, defaultMaterial) {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.3,
        roughness: 0.4
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.5;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0, material: defaultMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5);
    physicsWorld.addBody(groundBody);
}

function createVehicle(scene, physicsWorld, defaultMaterial) {
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    const chassisBody = new CANNON.Body({ mass: 150, material: defaultMaterial });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 4, 0);
    chassisBody.angularDamping = 0.5;

    const vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
    });

    // Wheels configuration
    const wheelOptions = {
        radius: 0.5,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 1.4,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence: 0.01,
        axleLocal: new CANNON.Vec3(1, 0, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };

    // Add wheels
    wheelOptions.chassisConnectionPointLocal.set(1, 0, 1);
    vehicle.addWheel(wheelOptions);

    wheelOptions.chassisConnectionPointLocal.set(-1, 0, 1);
    vehicle.addWheel(wheelOptions);

    wheelOptions.chassisConnectionPointLocal.set(1, 0, -1);
    vehicle.addWheel(wheelOptions);

    wheelOptions.chassisConnectionPointLocal.set(-1, 0, -1);
    vehicle.addWheel(wheelOptions);

    vehicle.addToWorld(physicsWorld);

    // Wheel Meshes
    const wheelVisuals = [];
    const wheelGeometry = new THREE.CylinderGeometry(wheelOptions.radius, wheelOptions.radius, 0.4, 32);
    wheelGeometry.rotateZ(Math.PI * 0.5);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: '#8b5cf6' });

    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        scene.add(wheelMesh);
        wheelVisuals.push(wheelMesh);
    }

    // Chassis Mesh
    const chassisGeometry = new THREE.BoxGeometry(2, 1, 4);
    const chassisMaterial = new THREE.MeshStandardMaterial({ color: '#06b6d4' });
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    scene.add(chassisMesh);

    // Sync function for wheels
    vehicle.syncVisuals = () => {
        for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            const transform = vehicle.wheelInfos[i].worldTransform;
            wheelVisuals[i].position.copy(transform.position);
            wheelVisuals[i].quaternion.copy(transform.quaternion);
        }
        chassisMesh.position.copy(chassisBody.position);
        chassisMesh.quaternion.copy(chassisBody.quaternion);
    };

    return vehicle;
}

function createEnvironment(scene, physicsWorld, defaultMaterial) {
    // Simple boxes as content markers
    const createMarker = (x, z, title, description) => {
        const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        const body = new CANNON.Body({ mass: 0, material: defaultMaterial }); // Static
        body.addShape(shape);
        body.position.set(x, 1, z);
        physicsWorld.addBody(body);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: '#f472b6' });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 1, z);
        mesh.castShadow = true;
        scene.add(mesh);

        // Save metadata for interaction
        mesh.userData = { isInteractable: true, title, description };

        return { mesh, body };
    };

    const markers = [
        createMarker(10, 10, 'Experience', 'Worked at Morgan Stanley, IDfy, LogisticsNow.'),
        createMarker(-10, 10, 'Projects', 'GenAI Configo, Market Whisperer, Auction Portal.'),
        createMarker(0, -15, 'Contact', 'Email: aparna.code98@gmail.com')
    ];
}

export function updateWorld(vehicle, keys) {
    if (!vehicle) return;

    const maxSteerVal = 0.5;
    const maxForce = 1000;
    const brakeForce = 1000000;

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    // Steering
    if (keys.left) {
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
    } else if (keys.right) {
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
    } else {
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
    }

    // Engine
    if (keys.forward) {
        vehicle.applyEngineForce(-maxForce, 2);
        vehicle.applyEngineForce(-maxForce, 3);
    } else if (keys.backward) {
        vehicle.applyEngineForce(maxForce, 2);
        vehicle.applyEngineForce(maxForce, 3);
    } else {
        vehicle.applyEngineForce(0, 2);
        vehicle.applyEngineForce(0, 3);
    }

    // Brake
    if (keys.brake) {
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
    }

    vehicle.syncVisuals();

    // Check Interactions (Naive Proximity)
    checkInteractions(vehicle.chassisBody.position);
}

// Interaction Logic
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');

closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Environment Data (Mirrors the createEnvironment markers)
const locations = [
    {
        x: 10, z: 10, title: 'Experience', html: `
        <h2>Experience</h2>
        <ul>
            <li><strong>Morgan Stanley (2022-Present)</strong>: Senior Software Engineer. Python/FastAPI, Azure, Kafka.</li>
            <li><strong>IDfy (2022)</strong>: Software Engineer. HRMS Integrations.</li>
            <li><strong>LogisticsNow (2020-2022)</strong>: Associate Software Engineer. Azure, SignalR.</li>
        </ul>
    `},
    {
        x: -10, z: 10, title: 'Projects', html: `
        <h2>Projects</h2>
        <ul>
            <li><strong>GenAI Configo</strong>: OpenAI + FastAPI.</li>
            <li><strong>Dynamic Dashboard</strong>: MongoDB + Kafka.</li>
            <li><strong>Auction Portal</strong>: Azure + Redis.</li>
        </ul>
    `},
    {
        x: 0, z: -15, title: 'Contact', html: `
        <h2>Contact</h2>
        <p>Let's build something together.</p>
        <p>Email: <a href="mailto:aparna.code98@gmail.com" style="color:#06b6d4">aparna.code98@gmail.com</a></p>
    `}
];

let currentActive = null;

function checkInteractions(position) {
    let nearOne = false;
    for (const loc of locations) {
        const dist = Math.sqrt(Math.pow(position.x - loc.x, 2) + Math.pow(position.z - loc.z, 2));
        if (dist < 4) {
            nearOne = true;
            if (currentActive !== loc.title) {
                currentActive = loc.title;
                modalContent.innerHTML = loc.html;
                modal.classList.add('active');
            }
        }
    }

    // Close if moved away from all? Optional.
    // For now, let user close manually or move to another.
    // If we want auto-close:
    /*
    if (!nearOne && currentActive) {
        modal.classList.remove('active');
        currentActive = null;
    }
    */
}
