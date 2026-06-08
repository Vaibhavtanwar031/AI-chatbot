/* ============================================================
   3D BOT AVATAR THREE.JS MODULE (js/avatar3d.js)
   ============================================================ */

let isThinking = false;
let coreMaterialRef = null;
let animationFrameId = null;
let rendererRef = null;

// Utility to fetch CSS variable as hex number (e.g., '--primary-start' => 0x0044ff)
function getCSSHexVariable(varName) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    // Expect value like '#0044ff' or '#8b5cf6'
    if (value.startsWith('#')) {
        return parseInt(value.slice(1), 16);
    }
    // Fallback to default accent if parsing fails
    return 0x8b5cf6;
}

function getAccentColor() {
    // Primary gradient start color used as accent throughout the UI
    return getCSSHexVariable('--primary-start') || 0x8b5cf6;
}

function getThinkingColor() {
    // A bright cyan for thinking state; fallback if not defined
    const val = getCSSHexVariable('--thinking-color');
    return val || 0x00ffcc;
}

window.init3dAvatar = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        if (!window.WebGLRenderingContext) {
            console.warn("WebGL unsupported. Disabling 3D backgrounds.");
            return;
        }
    } catch (e) {
        return;
    }

    container.innerHTML = "";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.8);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    const pinkLight = new THREE.PointLight(0xff00ff, 2.5, 50);
    pinkLight.position.set(5, -5, 5);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 2.5, 50);
    cyanLight.position.set(-5, 5, -5);
    scene.add(cyanLight);

    const botGroup = new THREE.Group();
    scene.add(botGroup);

    // ------- Campus Background Group -------
    const campusGroup = new THREE.Group();
    scene.add(campusGroup);



    // Helper to build a Gothic style Academic block
    function createGothicBlock(x, z, angle, name, themeColor) {
        const blockGroup = new THREE.Group();
        blockGroup.position.set(x, -6, z);
        blockGroup.rotation.y = -angle + Math.PI / 2;

        const wallMat = new THREE.MeshPhysicalMaterial({
            color: 0x1e1e2f,
            roughness: 0.6,
            metalness: 0.8,
            clearcoat: 0.3
        });

        const roofMat = new THREE.MeshPhysicalMaterial({
            color: themeColor,
            emissive: themeColor,
            emissiveIntensity: 0.3,
            roughness: 0.4
        });

        // Main body
        const bodyGeo = new THREE.BoxGeometry(6, 4, 3);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 2;
        blockGroup.add(body);

        // Gothic towers left and right
        const towerGeo = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
        const leftTower = new THREE.Mesh(towerGeo, wallMat);
        leftTower.position.set(-2.8, 3, 0);
        const rightTower = new THREE.Mesh(towerGeo, wallMat);
        rightTower.position.set(2.8, 3, 0);
        blockGroup.add(leftTower, rightTower);

        // Conical tower roofs
        const spireGeo = new THREE.ConeGeometry(0.6, 2, 8);
        const leftSpire = new THREE.Mesh(spireGeo, roofMat);
        leftSpire.position.set(-2.8, 7, 0);
        const rightSpire = new THREE.Mesh(spireGeo, roofMat);
        rightSpire.position.set(2.8, 7, 0);
        blockGroup.add(leftSpire, rightSpire);

        // Central archway entrance
        const archGeo = new THREE.CylinderGeometry(0.8, 0.8, 2, 8, 1, false, 0, Math.PI);
        const arch = new THREE.Mesh(archGeo, roofMat);
        arch.rotation.x = Math.PI / 2;
        arch.position.set(0, 1, 1.55);
        blockGroup.add(arch);

        // Windows grids
        const winGeo = new THREE.BoxGeometry(0.2, 0.4, 0.05);
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 4; c++) {
                const win = new THREE.Mesh(winGeo, windowMat);
                // Front facade windows
                win.position.set(-1.8 + c * 1.2, 1.2 + r * 1.6, 1.51);
                blockGroup.add(win);
            }
        }

        campusGroup.add(blockGroup);
        campusBuildings.push(blockGroup);
    }

    // Helper to build the Central Library (Circular Base + Glass Dome)
    function createCentralLibrary(x, z, angle) {
        const libGroup = new THREE.Group();
        libGroup.position.set(x, -6, z);
        libGroup.rotation.y = -angle + Math.PI / 2;

        const baseMat = new THREE.MeshPhysicalMaterial({
            color: 0x141424,
            roughness: 0.3,
            metalness: 0.9,
            clearcoat: 0.5
        });

        const domeMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffcc,
            transmission: 0.9,
            opacity: 1,
            roughness: 0.1,
            ior: 1.5,
            thickness: 0.5,
            emissive: 0x005544,
            emissiveIntensity: 0.5
        });

        // Cylinder base
        const baseGeo = new THREE.CylinderGeometry(2.5, 2.5, 3.5, 32);
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 1.75;
        libGroup.add(base);

        // Glass Dome
        const domeGeo = new THREE.SphereGeometry(2.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 3.5;
        libGroup.add(dome);

        // Glowing center core inside dome
        const coreGeo = new THREE.SphereGeometry(1, 16, 16);
        const coreMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffcc,
            emissive: 0x00ffcc,
            emissiveIntensity: 2.0
        });
        const domeCore = new THREE.Mesh(coreGeo, coreMat);
        domeCore.position.y = 4.2;
        libGroup.add(domeCore);

        // Glowing rings around base
        const torusGeo = new THREE.TorusGeometry(2.6, 0.05, 8, 48);
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffcc,
            emissive: 0x00ffcc,
            emissiveIntensity: 1.0
        });
        const baseRing1 = new THREE.Mesh(torusGeo, ringMat);
        baseRing1.rotation.x = Math.PI / 2;
        baseRing1.position.y = 1.0;
        
        const baseRing2 = baseRing1.clone();
        baseRing2.position.y = 2.5;

        libGroup.add(baseRing1, baseRing2);

        campusGroup.add(libGroup);
        campusBuildings.push(libGroup);
    }

    // Helper to build Residential Hostels (Twin blocks with connector)
    function createHostelBlocks(x, z, angle) {
        const hostelGroup = new THREE.Group();
        hostelGroup.position.set(x, -6, z);
        hostelGroup.rotation.y = -angle + Math.PI / 2;

        const wallMat = new THREE.MeshPhysicalMaterial({
            color: 0x22223b,
            roughness: 0.5,
            metalness: 0.7,
            clearcoat: 0.2
        });

        const roofMat = new THREE.MeshPhysicalMaterial({
            color: 0xff4757,
            roughness: 0.4
        });

        // Twin Hostel Towers
        const bodyGeo = new THREE.BoxGeometry(4, 5, 3.5);
        
        const tower1 = new THREE.Mesh(bodyGeo, wallMat);
        tower1.position.set(-2.2, 2.5, 0);
        
        const tower2 = new THREE.Mesh(bodyGeo, wallMat);
        tower2.position.set(2.2, 2.5, 0);
        
        hostelGroup.add(tower1, tower2);

        // Flat roofs
        const roofGeo = new THREE.BoxGeometry(4.4, 0.3, 3.9);
        const roof1 = new THREE.Mesh(roofGeo, roofMat);
        roof1.position.set(-2.2, 5.15, 0);
        const roof2 = new THREE.Mesh(roofGeo, roofMat);
        roof2.position.set(2.2, 5.15, 0);
        hostelGroup.add(roof1, roof2);

        // Connector bridge between towers
        const bridgeGeo = new THREE.BoxGeometry(1.5, 1, 1);
        const bridge = new THREE.Mesh(bridgeGeo, wallMat);
        bridge.position.set(0, 3.5, 0);
        hostelGroup.add(bridge);

        // Grid of glowing hostel room windows
        const winGeo = new THREE.BoxGeometry(0.15, 0.25, 0.05);
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const winT1 = new THREE.Mesh(winGeo, windowMat);
                winT1.position.set(-3.2 + c * 1.0, 1.0 + r * 1.3, 1.76);
                hostelGroup.add(winT1);

                const winT2 = new THREE.Mesh(winGeo, windowMat);
                winT2.position.set(1.2 + c * 1.0, 1.0 + r * 1.3, 1.76);
                hostelGroup.add(winT2);
            }
        }

        campusGroup.add(hostelGroup);
        campusBuildings.push(hostelGroup);
    }

    // Helper to build Sports Complex (Field + floodlights)
    function createSportsComplex(x, z, angle) {
        const sportsGroup = new THREE.Group();
        sportsGroup.position.set(x, -6, z);
        sportsGroup.rotation.y = -angle + Math.PI / 2;

        const fieldMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ff87,
            emissive: 0x004411,
            emissiveIntensity: 0.6,
            roughness: 0.9,
            metalness: 0.1
        });

        const trackGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 32);
        const track = new THREE.Mesh(trackGeo, fieldMat);
        track.scale.set(1, 1, 0.7);
        track.position.y = 0.1;
        sportsGroup.add(track);

        const neonTrackGeo = new THREE.TorusGeometry(3.7, 0.05, 8, 48);
        const neonMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ff87,
            emissive: 0x00ff87,
            emissiveIntensity: 1.5
        });
        const neonLoop = new THREE.Mesh(neonTrackGeo, neonMat);
        neonLoop.rotation.x = Math.PI / 2;
        neonLoop.scale.set(1.02, 0.72, 1);
        neonLoop.position.y = 0.2;
        sportsGroup.add(neonLoop);

        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
        const bulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const metalMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, metalness: 0.9 });
        const bulbMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0 });

        for (let i = 0; i < 2; i++) {
            const side = i === 0 ? -1 : 1;
            const post = new THREE.Mesh(postGeo, metalMat);
            post.position.set(side * 2.8, 2, 0);
            
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(side * 2.8, 4, 0);

            sportsGroup.add(post, bulb);
        }

        campusGroup.add(sportsGroup);
        campusBuildings.push(sportsGroup);
    }

    // Helper to build UEM Campus Arch Gate
    function createMainGate(x, z, angle) {
        const gateGroup = new THREE.Group();
        gateGroup.position.set(x, -6, z);
        gateGroup.rotation.y = -angle + Math.PI / 2;

        const gateMat = new THREE.MeshPhysicalMaterial({
            color: 0x1e1e2f,
            roughness: 0.4,
            metalness: 0.8
        });
        const glowMat = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            emissive: 0x8b5cf6,
            emissiveIntensity: 1.5
        });

        const pillarGeo = new THREE.BoxGeometry(0.8, 3, 0.8);
        const p1 = new THREE.Mesh(pillarGeo, gateMat);
        p1.position.set(-1.8, 1.5, 0);
        const p2 = new THREE.Mesh(pillarGeo, gateMat);
        p2.position.set(1.8, 1.5, 0);
        gateGroup.add(p1, p2);

        const archGeo = new THREE.BoxGeometry(4.4, 0.6, 1.0);
        const arch = new THREE.Mesh(archGeo, gateMat);
        arch.position.set(0, 3.2, 0);
        gateGroup.add(arch);

        const plateGeo = new THREE.BoxGeometry(1.6, 0.4, 0.1);
        const plate = new THREE.Mesh(plateGeo, glowMat);
        plate.position.set(0, 3.2, 0.51);
        gateGroup.add(plate);

        campusGroup.add(gateGroup);
        campusBuildings.push(gateGroup);
    }

    // List tracking structures and windows
    const campusBuildings = [];
    const windowMat = new THREE.MeshPhysicalMaterial({
        color: 0xffcc00,
        emissive: 0xffaa00,
        emissiveIntensity: 1.5,
        roughness: 0.1
    });

    // Lush Green Campus Base Plane (32-Acre Lawn Representation)
    const grassGeo = new THREE.CylinderGeometry(17, 17, 0.2, 64);
    const grassMat = new THREE.MeshPhysicalMaterial({
        color: 0x05230a,
        emissive: 0x021105,
        emissiveIntensity: 0.8,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = -6.1;
    campusGroup.add(grass);

    // Build the UEM Campus Components
    const campusRad = 13.5;
    createGothicBlock(campusRad * Math.cos(0), campusRad * Math.sin(0), 0, "CSE Block", 0x8b5cf6);
    createGothicBlock(campusRad * Math.cos(Math.PI * 0.4), campusRad * Math.sin(Math.PI * 0.4), Math.PI * 0.4, "ECE Block", 0x0044ff);
    createCentralLibrary(campusRad * Math.cos(Math.PI * 0.8), campusRad * Math.sin(Math.PI * 0.8), Math.PI * 0.8);
    createHostelBlocks(campusRad * Math.cos(Math.PI * 1.2), campusRad * Math.sin(Math.PI * 1.2), Math.PI * 1.2);
    createSportsComplex(campusRad * Math.cos(Math.PI * 1.6), campusRad * Math.sin(Math.PI * 1.6), Math.PI * 1.6);
    createMainGate(11.0 * Math.cos(Math.PI * 1.8), 11.0 * Math.sin(Math.PI * 1.8), Math.PI * 1.8);

    // Floating ecological green leaves (Ascending particles from the green UEM campus)
    const leafGeo = new THREE.ConeGeometry(0.12, 0.25, 3);
    const leafMat = new THREE.MeshPhysicalMaterial({
        color: 0x00ff66,
        emissive: 0x003311,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    const leaves = [];
    for (let i = 0; i < 40; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const angle = Math.random() * Math.PI * 2;
        const r = 4 + Math.random() * 11;
        leaf.position.set(
            Math.cos(angle) * r,
            -6 + Math.random() * 16,
            Math.sin(angle) * r
        );
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        campusGroup.add(leaf);
        leaves.push({
            mesh: leaf,
            speedY: 0.02 + Math.random() * 0.03,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            angleSpeed: 0.5 + Math.random() * 1.5,
            radius: r,
            baseAngle: angle
        });
    }

    const coreGeo = new THREE.SphereGeometry(2, 64, 64);
    const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: getAccentColor(),
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    botGroup.add(core);
    coreMaterialRef = coreMat;

    const shellGeo = new THREE.SphereGeometry(2.6, 64, 64);
    const shellMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.96,
        opacity: 1,
        metalness: 0.15,
        roughness: 0.05,
        ior: 1.45,
        thickness: 0.45,
        specularIntensity: 1.2,
        clearcoat: 1.0,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    botGroup.add(shell);

    const rings = [];
    const ringGeo = new THREE.TorusGeometry(3.6, 0.03, 32, 100);
    const ringColors = [
        getCSSHexVariable('--ring-cyan') || 0x00ffff,
        getAccentColor(),
        getCSSHexVariable('--ring-green') || 0x00ff87
    ];

    for (let i = 0; i < 3; i++) {
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: ringColors[i],
            emissive: ringColors[i],
            emissiveIntensity: 0.7,
            metalness: 1.0,
            roughness: 0.1,
            clearcoat: 1.0
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        botGroup.add(ring);

        rings.push({
            mesh: ring,
            speedX: (Math.random() - 0.5) * 0.015,
            speedY: (Math.random() - 0.5) * 0.015,
            speedZ: (Math.random() - 0.5) * 0.015
        });
    }

    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 65;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const createStarTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    };

    const particlesMat = new THREE.PointsMaterial({
        size: 0.35,
        color: getAccentColor(),
        transparent: true,
        opacity: 0.6,
        map: createStarTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(starField);

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const handleMouseMove = (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        targetX = mouseX * 0.005;
        targetY = mouseY * 0.005;

        botGroup.position.x += (targetX - botGroup.position.x) * 0.05;
        botGroup.position.y += (-targetY - botGroup.position.y) * 0.05;

        const floatSpeed = isThinking ? 4 : 2;
        const floatHeight = isThinking ? 0.02 : 0.01;
        botGroup.position.y += Math.sin(elapsed * floatSpeed) * floatHeight;

        const rotMultiplier = isThinking ? 2.5 : 1;
        core.rotation.y += 0.005 * rotMultiplier;
        core.rotation.x += 0.002 * rotMultiplier;
        shell.rotation.y -= 0.003 * rotMultiplier;
        shell.rotation.z += 0.001 * rotMultiplier;

        rings.forEach(r => {
            r.mesh.rotation.x += r.speedX * rotMultiplier;
            r.mesh.rotation.y += r.speedY * rotMultiplier;
            r.mesh.rotation.z += r.speedZ * rotMultiplier;
        });

        starField.rotation.y = elapsed * 0.015;
        starField.rotation.y = elapsed * 0.015;
        starField.rotation.x = elapsed * 0.008;



        // Dynamic hovered breathing/swaying of Gothic/modern buildings
        campusBuildings.forEach((b, idx) => {
            const hoverSpeed = 1.2 + idx * 0.15;
            const hoverHeight = 0.08;
            b.position.y = -6 + Math.sin(elapsed * hoverSpeed) * hoverHeight;
            b.rotation.y += Math.sin(elapsed * 0.3) * 0.0003;
        });

        // Pulse the campus glowing window lights
        const windowPulse = 0.8 + Math.sin(elapsed * (isThinking ? 12 : 3)) * 0.4;
        windowMat.emissiveIntensity = windowPulse * 1.5;
        if (isThinking) {
            windowMat.emissive.setHex(getThinkingColor());
            windowMat.color.setHex(getThinkingColor());
        } else {
            windowMat.emissive.setHex(0xffaa00);
            windowMat.color.setHex(0xffcc00);
        }

        // Animate floating green campus leaves
        leaves.forEach(l => {
            l.mesh.position.y += l.speedY * rotMultiplier;
            l.mesh.rotation.x += l.rotSpeed * rotMultiplier;
            l.mesh.rotation.y += l.rotSpeed * rotMultiplier;
            // Gentle side sway
            l.mesh.position.x += Math.sin(elapsed * l.angleSpeed) * 0.01;
            
            // Reset if leaf leaves the campus model airspace
            if (l.mesh.position.y > 12) {
                l.mesh.position.y = -6;
                l.mesh.position.x = Math.cos(l.baseAngle) * l.radius;
                l.mesh.position.z = Math.sin(l.baseAngle) * l.radius;
            }
        });

        const pulseSpeed = isThinking ? 8 : 3;
        coreMat.emissiveIntensity = 0.65 + Math.sin(elapsed * pulseSpeed) * 0.35;

        pinkLight.position.x = 5 + Math.sin(elapsed * 1.5) * 2;
        cyanLight.position.x = -5 + Math.cos(elapsed * 1.5) * 2;

        renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return {
        destroy: () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (rendererRef && rendererRef.domElement) {
                rendererRef.domElement.remove();
            }
            // Dispose campus group children
            if (typeof campusGroup !== 'undefined') {
                campusGroup.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                    if (child.texture) child.texture.dispose();
                });
            }
        }
    };
};

window.setAvatarThinking = function (state) {
    isThinking = !!state;
    if (coreMaterialRef) {
        coreMaterialRef.emissive.setHex(isThinking ? getThinkingColor() : getAccentColor());
    }
};
