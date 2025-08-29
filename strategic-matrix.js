// Strategic Matrix - Controlador principal e visualização 3D
class StrategicMatrix3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.spheres = {};
        this.connections = [];
        this.labels = [];
        this.isDragging = false;
        this.selectedObject = null;
        
        this.container = null;
        this.tooltip = null;
        
        this.animationId = null;
        this.isInitialized = false;
    }

    init(containerId = 'matrix3d-container') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Adicionar CSS para cursor drag
        const style = document.createElement('style');
        style.textContent = '.matrix-dragging { cursor: grabbing !important; }';
        document.head.appendChild(style);

        // Configurar cena
        this.setupScene();
        this.setupLights();
        this.setupGrid();
        this.createSpheres();
        this.setupEventListeners();
        this.setupSidebarToggle();
        
        // Criar tooltip
        this.createTooltip();
        
        // Sincronizar com engine
        this.setupEngineSync();
        
        // Iniciar animação
        this.animate();
        
        this.isInitialized = true;

        setTimeout(() => {
        this.onWindowResize();
        if (this.controls) this.controls.update();
    }, 100);
        
        // Atualizar posição inicial
        this.updateFromEngine();
    }

setupSidebarToggle() {
    const sidebar = document.querySelector('.matrix-sidebar');
    const visualization = document.querySelector('.matrix-visualization');
    const mainContainer = document.querySelector('.matrix-main-container');
    const modalBody = document.querySelector('.unicorn-modal-body');
    
    if (!sidebar || !visualization) return;
    
    // Limpar botões existentes
    const existingFloatingBtn = document.querySelector('.sidebar-toggle-floating');
    const existingInnerBtn = document.querySelector('.sidebar-inner-toggle');
    const existingFullscreenBtn = document.querySelector('.sidebar-fullscreen-toggle');
    const existingMinimizeBtn = document.querySelector('.sidebar-minimize-toggle');
    
    if (existingFloatingBtn) existingFloatingBtn.remove();
    if (existingInnerBtn) existingInnerBtn.remove();
    if (existingFullscreenBtn) existingFullscreenBtn.remove();
    if (existingMinimizeBtn) existingMinimizeBtn.remove();
    
    // Criar botão flutuante (sempre visível)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle-floating';
    toggleBtn.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 1001;
        opacity: 0.8;
    `;
    mainContainer.appendChild(toggleBtn);
    
    // SEMPRE começar com sidebar ABERTO
    let isRetracted = false;
    
    // Aplicar estado inicial ABERTO
    sidebar.classList.remove('retracted');
    visualization.classList.remove('expanded');
    mainContainer.classList.remove('sidebar-hidden');
    toggleBtn.classList.remove('visible');
    toggleBtn.innerHTML = '<span class="material-icons"></span>'; // > quando aberto
    toggleBtn.style.right = '-325px';
    
    const toggleSidebar = () => {
        isRetracted = !isRetracted;
        
        if (isRetracted) {
            // Fechando sidebar
            sidebar.classList.add('retracted');
            visualization.classList.add('expanded');
            mainContainer.classList.add('sidebar-hidden');
            toggleBtn.innerHTML = '<span class="material-icons">chevron_left</span>'; // < quando fechado
            toggleBtn.style.right = '10px';
            
            // Salvar estado
            localStorage.setItem('matrixSidebarRetracted', 'true');
        } else {
            // Abrindo sidebar
            sidebar.classList.remove('retracted');
            visualization.classList.remove('expanded');
            mainContainer.classList.remove('sidebar-hidden');
            toggleBtn.innerHTML = '<span class="material-icons"></span>'; // > quando aberto
            toggleBtn.style.right = '-325px'; // Posição ao lado da sidebar aberta
            
            // Salvar estado
            localStorage.setItem('matrixSidebarRetracted', 'false');
        }
        
        // Resize após animação
        setTimeout(() => {
            this.onWindowResize();
            if (this.controls) this.controls.update();
        }, 350);
    };
    
    toggleBtn.addEventListener('click', toggleSidebar);
    
    // Criar botões internos na sidebar
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-inner-toggle';
    sidebarToggle.innerHTML = '<span class="material-icons">chevron_right</span>';
    sidebarToggle.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 100;
    `;
    
    // Botão minimizar (NOVO)
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'sidebar-minimize-toggle';
    minimizeBtn.innerHTML = '<span class="material-icons">minimize</span>';
    minimizeBtn.style.cssText = `
        position: absolute;
        right: 78px;
        top: 10px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 101;
        padding-bottom: 15px;
    `;
    
    // Botão fullscreen
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'sidebar-fullscreen-toggle';
    fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
    fullscreenBtn.style.cssText = `
        position: absolute;
        right: 44px;
        top: 10px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 101;
    `;
    
    const firstCard = sidebar.querySelector('.matrix-info-card');
    if (firstCard) {
        firstCard.style.position = 'relative';
        firstCard.appendChild(sidebarToggle);
        firstCard.appendChild(fullscreenBtn);
        firstCard.appendChild(minimizeBtn);
    }
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    fullscreenBtn.addEventListener('click', () => {
        MatrixController.toggleFullScreen();
    });
    
    // Handler para minimizar
    minimizeBtn.addEventListener('click', () => {
        const modal = document.getElementById('unicornModal');
        const unicornBtn = document.querySelector('.floating-unicorn-button');
        
        if (modal && unicornBtn) {
            // Minimizar modal
            modal.classList.add('minimized');
            modal.style.transform = 'scale(0.1)';
            modal.style.transformOrigin = 'bottom left';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            
            // Adicionar animação pulse ao botão 🦄 existente
            unicornBtn.classList.add('pulsing');
            
            // Adicionar CSS para animação pulse se não existir
            if (!document.querySelector('#pulse-animation-style')) {
                const style = document.createElement('style');
                style.id = 'pulse-animation-style';
                style.textContent = `
                    @keyframes unicornPulse {
                        0%, 100% {
                            transform: scale(1);
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                        }
                        50% {
                            transform: scale(1.05);
                            box-shadow: 0 12px 24px rgba(167, 139, 250, 0.6);
                        }
                    }
                    .floating-unicorn-button.pulsing {
                        animation: unicornPulse 1.9s infinite;
                        background: linear-gradient(-135deg, #a78bfa 0%, #6d28d9 100%) !important;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Modificar comportamento do botão unicórnio temporariamente
            const originalClickHandler = unicornBtn.onclick;
            
            unicornBtn.onclick = function() {
                if (modal.classList.contains('minimized')) {
                    // Restaurar modal
                    modal.classList.remove('minimized');
                    modal.style.transform = '';
                    modal.style.opacity = '';
                    modal.style.pointerEvents = '';
                    
                    // Remover animação pulse
                    unicornBtn.classList.remove('pulsing');
                    
                    // Restaurar handler original
                    unicornBtn.onclick = originalClickHandler;
                } else {
                    // Comportamento normal
                    if (originalClickHandler) originalClickHandler.call(this);
                }
            };
        }
    });
    
    // Ajustar tamanho inicial após um pequeno delay
    setTimeout(() => {
        this.onWindowResize();
    }, 100);
}

    setupScene() {
        // Cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(15, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controles orbitais
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 40;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;

        this.controls.rotateSpeed = 0.8;
        this.controls.zoomSpeed = 0.8;  
        this.controls.panSpeed = 0.18;
    }

    setupLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Luz direcional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz pontual para realce
        const pointLight = new THREE.PointLight(0xa78bfa, 0.5, 30);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }

    setupGrid() {
    const gridSize = 20;
    const divisions = 10;
    
    // Grid XZ (Tech x Platform)
    const gridXZ = new THREE.GridHelper(gridSize, divisions, 0x667eea, 0x333366);
    gridXZ.position.y = -10;
    this.scene.add(gridXZ);

    // Criar eixos com interatividade
    this.axisHelpers = [];
    
    // Eixo X - Tech & Automação
    this.createInteractiveAxis('Tech & Automação', 
        new THREE.Vector3(1, 0, 0), 
        new THREE.Vector3(10, 0, 0),
        0xfc8d56
    );
    
    // Eixo Z - Marketplace
    this.createInteractiveAxis('Marketplace', 
        new THREE.Vector3(0, 0, 1), 
        new THREE.Vector3(0, 0, 10),
        0xa78bfa
    );
    
    // Eixo Y - Recorrência
    this.createInteractiveAxis('Recorrência', 
        new THREE.Vector3(0, 1, 0), 
        new THREE.Vector3(0, 10, 0),
        0x22c55e
    );
    
    // Planos semi-transparentes
    this.planes = {};
    this.planesClickCount = {};
    this.createInteractivePlane('XZ', 0x667eea);
    this.createInteractivePlane('XY', 0xa78bfa);
    this.createInteractivePlane('YZ', 0x22c55e);
}

createInteractiveAxis(name, direction, position, color) {
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 12;
    
    // Arrow helper visual (renderOrder alto para ficar sobre a esfera)
    const arrowHelper = new THREE.ArrowHelper(
        direction, 
        origin, 
        length, 
        color,
        3,
        2
    );
    arrowHelper.renderOrder = 10; // Garante que fica sobre tudo
    this.scene.add(arrowHelper);
    
    // Cilindro invisível para detecção de hover
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, length, 8);
    const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthTest: false
    });
    
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Posicionar e rotacionar o cilindro
    if (direction.x === 1) { // Eixo X
        cylinder.rotation.z = -Math.PI / 2;
        cylinder.position.set(length / 2, 0, 0);
    } else if (direction.y === 1) { // Eixo Y
        cylinder.position.set(0, length / 2, 0);
    } else if (direction.z === 1) { // Eixo Z
        cylinder.rotation.x = Math.PI / 2;
        cylinder.position.set(0, 0, length / 2);
    }
    
    cylinder.userData = {
        type: 'axis',
        name: name,
        color: color
    };
    
    this.axisHelpers.push(cylinder);
    this.scene.add(cylinder);
    
    // Label visual
    this.createTextLabel(name, position, color);
}

    createPlane(orientation, color) {
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.02,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geometry, material);
        
        if (orientation === 'XZ') {
            plane.rotation.x = Math.PI / 2;
            plane.position.y = -10;
        } else if (orientation === 'XY') {
            plane.position.z = -10;
        } else if (orientation === 'YZ') {
            plane.rotation.y = Math.PI / 2;
            plane.position.x = -10;
        }
        
        this.scene.add(plane);
    }

    createInteractivePlane(orientation, color) {
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.02,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry, material);
    
    if (orientation === 'XZ') {
        plane.rotation.x = Math.PI / 2;
        plane.position.y = -10;
    } else if (orientation === 'XY') {
        plane.position.z = -10;
    } else if (orientation === 'YZ') {
        plane.rotation.y = Math.PI / 2;
        plane.position.x = -10;
    }
    
    plane.userData = { orientation, originalOpacity: 0.02, clickable: true };
    this.planes[orientation] = plane;
    this.planesClickCount[orientation] = 0;
    this.scene.add(plane);
}

    createSpheres() {
        // Criar esferas para cada unicórnio
        Object.entries(MatrixData.unicorns).forEach(([key, unicorn]) => {
            const position = this.coordinatesToPosition(unicorn.coordinates);
            const size = 0.3 + (unicorn.valuation / 100000) * 0.85; // tamanho baseado em valuation
            
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(unicorn.color),
                metalness: 0.3,
                roughness: 0.4,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transparent: true,
                opacity: 0.9
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(position);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData = { 
                type: 'unicorn', 
                key: key,
                data: unicorn 
            };
            
            this.scene.add(sphere);
            this.spheres[key] = sphere;
            
            // Adicionar anel orbital
            this.addOrbitalRing(sphere, size + 0.2, unicorn.color);
            
            // Label
            this.createTextLabel(unicorn.name, position.clone().add(new THREE.Vector3(0, size + 1, 0)), unicorn.color);
        });

        // Criar esfera da Soller
        this.createSollerSphere();
    }

    createSollerSphere() {
    const position = this.coordinatesToPosition(MatrixEngine.sollerPosition);
    
    // Calcular tamanho baseado no valuation estimado
    const valuation = MatrixEngine.estimateValuation(MatrixEngine.sollerPosition);
    const valuationInMillions = valuation / 5000000;
    const size = 0.3 + (valuationInMillions / 100000) * 0.85;
    const clampedSize = Math.min(Math.max(size, 0.4), 1.2);
    
    // Criar grupo para a Soller (facilita controle de renderização)
    const sollerGroup = new THREE.Group();
    
    // Geometria esférica
    const geometry = new THREE.SphereGeometry(clampedSize, 64, 64);
    
    // Material com depthTest false para sempre ficar visível
    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(MatrixData.visualization.colors.soller),
        metalness: 0.2,
        roughness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color(MatrixData.visualization.colors.soller),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.95,
        depthWrite: true,
        depthTest: true // Mantém true mas vamos usar outra estratégia
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    
    // Adicionar uma segunda esfera com outline para garantir visibilidade
    const outlineGeometry = new THREE.SphereGeometry(clampedSize * 1.05, 64, 64);
    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(MatrixData.visualization.colors.soller),
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false // Outline sempre visível
    });
    
    const outlineSphere = new THREE.Mesh(outlineGeometry, outlineMaterial);
    
    // Adicionar ao grupo
    sollerGroup.add(outlineSphere);
    sollerGroup.add(sphere);
    sollerGroup.position.copy(position);
    
    // Ordem de renderização estratégica
    outlineSphere.renderOrder = 998; // Outline renderiza primeiro (atrás)
    sphere.renderOrder = 999; // Esfera principal renderiza depois
    
    sphere.userData = { 
        type: 'soller',
        draggable: true,
        valuation: valuation,
        size: clampedSize
    };
    
    // Armazenar referências
    this.scene.add(sollerGroup);
    this.spheres.soller = sphere;
    this.sollerGroup = sollerGroup;
    
    // Adicionar glow effect
    this.addGlowEffect(sphere, clampedSize + 0.3, MatrixData.visualization.colors.soller);
    
    // Adicionar anéis pulsantes
    this.addPulsingRings(sphere, clampedSize + 0.5);
    
    // Label
    const labelText = `Soller (R$ ${(valuation/1000000).toFixed(0)}M)`;
    this.createTextLabel(labelText, position.clone().add(new THREE.Vector3(0, clampedSize + 1.5, 0)), MatrixData.visualization.colors.soller, true);
    
    this.currentSollerSize = clampedSize;
}

// Adicionar função para atualizar tamanho dinamicamente quando posição muda
updateSollerSize() {
    if (!this.spheres.soller || !MatrixEngine) return;
    
    const valuation = MatrixEngine.estimateValuation(MatrixEngine.sollerPosition);
    const valuationInMillions = valuation / 5000000;
    const newSize = 0.3 + (valuationInMillions / 100000) * 0.85;
    const clampedSize = Math.min(Math.max(newSize, 0.4), 1.2);
    
    // Só atualizar se mudou significativamente (>5%)
    if (Math.abs(clampedSize - this.currentSollerSize) > this.currentSollerSize * 0.05) {
        // Animar mudança de escala
        const duration = 1000;
        const start = performance.now();
        const startScale = this.spheres.soller.scale.x;
        const targetScale = clampedSize / this.currentSollerSize;
        
        const animateScale = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            const scale = startScale + (targetScale - startScale) * eased;
            this.spheres.soller.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                requestAnimationFrame(animateScale);
            } else {
                this.currentSollerSize = clampedSize;
                this.spheres.soller.userData.size = clampedSize;
                this.spheres.soller.userData.valuation = valuation;
            }
        };
        
        requestAnimationFrame(animateScale);
    }
}

// Atualizar updateFromEngine() para incluir atualização de tamanho
updateFromEngine() {
    if (!this.spheres || !this.spheres.soller || !MatrixEngine) return;
    
    const position = MatrixEngine.sollerPosition;
    const pos3D = this.coordinatesToPosition(position);
    
    // Animar esfera
    this.animateSphere(this.spheres.soller, pos3D);
    
    // Atualizar tamanho baseado no novo valuation
    this.updateSollerSize();
    
    // Atualizar displays
    this.updatePositionDisplay(position);
    this.updateProximityDisplay();
    this.updateTradeOffsDisplay();
    this.updateSlidersFromPosition(position);
    
    // Atualizar conexões
    this.updateConnections();
}

    addOrbitalRing(sphere, radius, color) {
        const geometry = new THREE.TorusGeometry(radius, 0.02, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        sphere.add(ring);
    }

    addGlowEffect(sphere, radius, color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) },
                viewVector: { value: this.camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float intensity;
                void main() {
                    vec3 glow = color * intensity;
                    gl_FragColor = vec4(glow, intensity * 0.2);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        const glow = new THREE.Mesh(geometry, material);
        
        glow.renderOrder = 998;
        glow.material.depthTest = false;

        sphere.add(glow);
    }

    addPulsingRings(sphere, radius) {
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.RingGeometry(radius + i * 0.3, radius + i * 0.3 + 0.1, 64);
        const material = new THREE.MeshBasicMaterial({
            color: MatrixData.visualization.colors.soller,
            transparent: true,
            opacity: 0.3 - i * 0.1,
            side: THREE.DoubleSide,
            depthTest: false, // Desativa o teste de profundidade para este material
            depthWrite: false // Desativa a escrita no buffer de profundidade
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.userData = { pulsePhase: i * 2 };
        ring.renderOrder = 1000 + i; // Define uma alta ordem de renderização para aparecer por cima de tudo
        sphere.add(ring);
    }
}

    createTextLabel(text, position, color, special = false) {
        // Implementação simplificada - em produção, usar CSS2DRenderer
        // Por ora, vamos apenas armazenar as posições dos labels
        this.labels.push({ text, position, color, special });
    }

    coordinatesToPosition(coords) {
        if (!coords) return new THREE.Vector3(0, 0, 0);
        
        // Mapear coordenadas 5D para posição 3D
        // Usamos 3 dimensões principais: tech (X), platform (Z), recurring (Y)
        // Scale e B2B são representados por cor/tamanho
        const x = (coords.tech - 50) / 5;
        const y = (coords.recurring - 50) / 5;
        const z = (coords.platform - 50) / 5;
        
        return new THREE.Vector3(x, y, z);
    }

    positionToCoordinates(position) {
        // Inverter o mapeamento 3D para 5D
        const b2bFocus = MatrixEngine && MatrixEngine.sollerPosition ? MatrixEngine.sollerPosition.b2bFocus : 80;
        
        return {
            tech: Math.max(0, Math.min(100, position.x * 5 + 50)),
            platform: Math.max(0, Math.min(100, position.z * 5 + 50)),
            recurring: Math.max(0, Math.min(100, position.y * 5 + 50)),
            scale: Math.max(0, Math.min(100, 50 + Math.sqrt(position.x * position.x + position.z * position.z) * 3)),
            b2bFocus: Math.max(0, Math.min(100, b2bFocus))
        };
    }

    setupEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Dimension sliders
        this.setupDimensionSliders();

        // Adicionar debounce para resize
let resizeTimeout;
const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        this.onWindowResize();
        // Forçar recálculo do layout
        const modalContent = this.container.closest('.unicorn-modal-content');
        if (modalContent && modalContent.classList.contains('full-screen')) {
            // Remover e readicionar a classe para forçar recálculo
            modalContent.style.display = 'none';
            modalContent.offsetHeight; // Força reflow
            modalContent.style.display = '';
        }
    }, 100);
};

window.addEventListener('resize', debouncedResize);

// Detectar mudanças no fullscreen via F11
document.addEventListener('fullscreenchange', debouncedResize);
document.addEventListener('webkitfullscreenchange', debouncedResize);
document.addEventListener('mozfullscreenchange', debouncedResize);
document.addEventListener('MSFullscreenChange', debouncedResize);
    }

    setupDimensionSliders() {
    // CORREÇÃO: Usar o container correto - dimensionSliders, não currentPosition!
    const slidersContainer = document.getElementById('dimensionSliders');
    if (!slidersContainer || !MatrixData || !MatrixEngine) return;
    
    // Limpar container
    slidersContainer.innerHTML = '';
    
    Object.entries(MatrixData.dimensions).forEach(([key, dim]) => {
        const control = document.createElement('div');
        control.className = 'dimension-control';
        control.innerHTML = `
            <label>${dim.icon} ${dim.name}</label>
            <div class="value-display" id="dim-value-${key}">
                ${MatrixEngine.sollerPosition[key]}%
            </div>
            <input type="range" 
                   class="dimension-slider" 
                   id="dim-slider-${key}"
                   min="0" 
                   max="100" 
                   value="${MatrixEngine.sollerPosition[key]}"
                   data-dimension="${key}">
        `;
        slidersContainer.appendChild(control);
        
        // Event listener
        const slider = control.querySelector(`#dim-slider-${key}`);
        slider.addEventListener('input', this.onSliderChange.bind(this));
    });
    
    // Manter a visualização no currentPosition também
    this.updatePositionDisplay(MatrixEngine.sollerPosition);
}

createDimensionSlider(key, container) {
    const dim = MatrixData.dimensions[key];
    const value = Math.round(MatrixEngine.sollerPosition[key]);
    
    const control = document.createElement('div');
    control.className = 'position-metric slider-control';
    control.innerHTML = `
        <div class="label">${dim.icon} ${dim.name}</div>
        <div class="slider-with-value">
            <input type="range" 
                   class="dimension-slider" 
                   id="dim-slider-${key}"
                   min="0" 
                   max="100" 
                   value="${value}"
                   data-dimension="${key}">
            <div class="slider-value-display" id="dim-value-${key}">${value}%</div>
        </div>
        <div class="axis-bar">
            <div class="axis-fill" id="axis-fill-${key}" style="width: ${value}%"></div>
        </div>
    `;
    container.appendChild(control);
    
    // Event listener CRUCIAL
    const slider = control.querySelector('.dimension-slider');
    slider.addEventListener('input', (e) => {
        this.onSliderChange(e);
    });
}

    onSliderChange(event) {
    if (!MatrixEngine) return;
    
    const dimension = event.target.dataset.dimension;
    const value = parseFloat(event.target.value);
    
    // Atualizar displays
    document.getElementById(`dim-value-${dimension}`).textContent = `${Math.round(value)}%`;
    document.getElementById(`axis-fill-${dimension}`).style.width = `${value}%`;
    
    // Atualizar posição
    const newPosition = { ...MatrixEngine.sollerPosition };
    newPosition[dimension] = value;
    
    // Para Scale e B2B Focus, apenas atualizar conexões
    if (dimension === 'scale' || dimension === 'b2bFocus') {
        MatrixEngine.sollerPosition = newPosition;
        this.updateConnections(); // Atualizar linhas imediatamente
        this.syncToForecast(MatrixEngine.positionToProjectionParams(newPosition));
    } else {
        // Para outras dimensões, animar esfera
        this.animateSollerToPosition(newPosition);
        MatrixEngine.sollerPosition = newPosition;
        this.syncToForecast(MatrixEngine.positionToProjectionParams(newPosition));
    }
}

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (this.isDragging && this.selectedObject) {
            this.dragObject();
        } else {
            this.checkHover();
        }
    }

    onMouseDown(event) {
    if (event.button !== 0) return;
    
    if (!this.raycaster || !this.camera || !this.spheres || !this.spheres.soller) return;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Verificar clique nos planos PRIMEIRO
    if (this.planes && Object.keys(this.planes).length > 0) {
        const planeIntersects = this.raycaster.intersectObjects(Object.values(this.planes));
        if (planeIntersects.length > 0) {
            const clickedPlane = planeIntersects[0].object;
            const orientation = clickedPlane.userData.orientation;
            
            if (!this.planesClickCount[orientation]) {
                this.planesClickCount[orientation] = 0;
            }
            
            this.planesClickCount[orientation]++;
            if (this.planesClickCount[orientation] >= 3) {
                const isHidden = clickedPlane.material.opacity < 0.01;
                clickedPlane.material.opacity = isHidden ? 0.02 : 0;
                this.planesClickCount[orientation] = 0;
            }
            
            clearTimeout(this.planeClickTimeout);
            this.planeClickTimeout = setTimeout(() => {
                Object.keys(this.planesClickCount).forEach(key => {
                    this.planesClickCount[key] = 0;
                });
            }, 2000);
            
            return; // Importante: sair aqui se clicou em plano
        }
    }
    
    // Verificar drag da esfera
    const intersects = this.raycaster.intersectObjects(Object.values(this.spheres));
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && object.userData.draggable) {
            this.isDragging = true;
            this.selectedObject = object;
            if (this.controls) this.controls.enabled = false;
            
            if (this.renderer && this.renderer.domElement) {
                this.renderer.domElement.classList.add('matrix-dragging');
            }
            
            this.dragPlane = new THREE.Plane(
                new THREE.Vector3(0, 1, 0),
                -intersects[0].point.y
            );
        }
    }
}

    onMouseUp() {
        if (this.isDragging) {
            if (this.selectedObject && this.spheres && this.spheres.soller && this.selectedObject === this.spheres.soller) {
                // Sincronizar posição final com forecast se foi a Soller que foi arrastada
                const finalPosition = this.spheres.soller.position.clone();
                this.syncToForecastDrag(finalPosition);
            }
            
            // Limpar estado de drag
            this.isDragging = false;
            this.selectedObject = null;
            if (this.controls) this.controls.enabled = true;
            if (this.renderer && this.renderer.domElement) {
                this.renderer.domElement.classList.remove('matrix-dragging');
            }
        }
    }

    dragObject() {
        if (!this.isDragging || !this.selectedObject || !this.raycaster || !this.camera) return;
        
        // Criar plano de drag se não existir
        if (!this.dragPlane) {
            this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.selectedObject.position.y);
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
        
        // Limitar movimento dentro de bounds
        const maxDistance = 10;
        if (intersectPoint.length() > maxDistance) {
            intersectPoint.normalize().multiplyScalar(maxDistance);
        }
        
        this.selectedObject.position.x = intersectPoint.x;
        this.selectedObject.position.z = intersectPoint.z;
        
        // Atualizar displays em tempo real
        const coordinates = this.positionToCoordinates(intersectPoint);
        this.updatePositionDisplay(coordinates);
        this.updateProximityDisplay();
        
        // Atualizar conexões
        this.updateConnections();
    }

    checkHover() {
    if (!this.raycaster || !this.camera) return;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Primeiro verifica eixos
    if (this.axisHelpers) {
        const axisIntersects = this.raycaster.intersectObjects(this.axisHelpers);
        if (axisIntersects.length > 0) {
            const axis = axisIntersects[0].object;
            this.showAxisTooltip(axis);
            this.renderer.domElement.style.cursor = 'help';
            return;
        }
    }
    
    // Depois verifica esferas
    if (this.spheres) {
        const intersects = this.raycaster.intersectObjects(Object.values(this.spheres));
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.showTooltip(object);
            this.renderer.domElement.style.cursor = object.userData.draggable ? 'grab' : 'pointer';
            return;
        }
    }
    
    // Nada detectado
    this.hideTooltip();
    if (this.renderer && this.renderer.domElement) {
        this.renderer.domElement.style.cursor = 'default';
    }
}

// Nova função para tooltip de eixos
showAxisTooltip(axis) {
    if (!this.tooltip || !axis.userData) return;
    
    const vector = axis.position.clone();
    vector.project(this.camera);
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
    
    this.tooltip.style.left = x + 'px';
    this.tooltip.style.top = (y - 20) + 'px';
    
    const axisData = axis.userData;
    const dimensions = {
        'Tech & Automação': {
            description: 'Grau de automação e tecnologia implementada',
            impact: 'Aumenta eficiência operacional e margem',
            current: Math.round(MatrixEngine.sollerPosition.tech) + '%'
        },
        'Marketplace': {
            description: 'Transformação de agência para plataforma digital',
            impact: 'Escala exponencial e redução de CAC',
            current: Math.round(MatrixEngine.sollerPosition.platform) + '%'
        },
        'Recorrência': {
            description: 'Modelo de receita recorrente vs transacional',
            impact: 'Previsibilidade e múltiplos de valuation',
            current: Math.round(MatrixEngine.sollerPosition.recurring) + '%'
        }
    };
    
    const info = dimensions[axisData.name] || {};
    
    this.tooltip.innerHTML = `
        <h5 style="color: #${axisData.color.toString(16).padStart(6, '0')}">
            ${axisData.name}
        </h5>
        <div class="tooltip-metrics">
            <div class="metric-row">
                <span class="metric-label-chart" style="display: block; margin-bottom: 4px;">
                    ${info.description || ''}
                </span>
            </div>
            <div class="metric-row">
                <span class="metric-label-chart">Impacto:</span>
                <span class="metric-value-chart">${info.impact || ''}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label-chart">Posição Atual:</span>
                <span class="metric-value-chart">${info.current || '0%'}</span>
            </div>
        </div>
    `;
    
    this.tooltip.classList.add('visible');
}

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'matrix-tooltip';
        this.container.appendChild(this.tooltip);
    }

    showTooltip(object) {
        if (!this.tooltip) return;
        
        const vector = object.position.clone();
        vector.project(this.camera);
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
        
        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = (y - 20) + 'px';
        
        if (object.userData.type === 'unicorn') {
            const unicorn = object.userData.data;
            this.tooltip.innerHTML = `
                <h5 style="color: ${unicorn.color}">${unicorn.name}</h5>
                <div class="tooltip-metrics">
                    <div class="metric-row">
                        <span class="metric-label-chart">Valuation:</span>
                        <span class="metric-value-chart">$${unicorn.valuation > 1000 ? (unicorn.valuation/1000).toFixed(1) + 'B' : unicorn.valuation + 'M'}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label-chart">Crescimento:</span>
                        <span class="metric-value-chart">${unicorn.metrics.growth}% YoY</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label-chart">Margem:</span>
                        <span class="metric-value-chart">${unicorn.metrics.margin}%</span>
                    </div>
                </div>
            `;
        } else if (object.userData.type === 'soller') {
            if (!MatrixEngine || !MatrixData) return;
            
            const position = MatrixEngine.sollerPosition;
            const valuation = MatrixEngine.estimateValuation(position);
            const sollerColor = MatrixData.visualization?.colors?.soller || '#a78bfa';
            
            this.tooltip.innerHTML = `
                <h5 style="color: ${sollerColor}">Soller</h5>
                <div class="tooltip-metrics">
                    <div class="metric-row">
                        <span class="metric-label-chart">Valuation:</span>
                        <span class="metric-value-chart-">R$ ${(valuation/1000000).toFixed(0)}M</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label-chart">Tech:</span>
                        <span class="metric-value-chart">${position.tech.toFixed(0)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label-chart">Platform:</span>
                        <span class="metric-value-chart">${position.platform.toFixed(0)}%</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label-chart">Recurring:</span>
                        <span class="metric-value-chart">${position.recurring.toFixed(0)}%</span>
                    </div>
                </div>
            `;
        }
        
        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
        }
    }

    setupEngineSync() {
        // Escutar mudanças no engine
        if (MatrixEngine && MatrixEngine.on) {
            MatrixEngine.on('positionUpdated', (position) => {
                this.updateFromEngine();
            });
        }
    }

updateSpheresOpacity() {
    if (!this.spheres || !this.controls) return;

    // Distância atual da câmera ao centro da cena
    const distance = this.camera.position.distanceTo(this.controls.target);
    
    // Opcional: Normalize a distância em relação à distância máxima do zoom
    const normalizedDistance = Math.min(distance / this.controls.maxDistance, 1);
    
    const minOpacity = 0.99;
    const maxOpacity = 1.0;
    const opacity = maxOpacity - (maxOpacity - minOpacity) * normalizedDistance;

    Object.values(this.spheres).forEach(sphere => {
        if (sphere && sphere.material) {
            sphere.material.opacity = opacity;
        }
    });
}

    updateFromEngine() {
        if (!this.spheres || !this.spheres.soller || !MatrixEngine) return;
        
        const position = MatrixEngine.sollerPosition;
        const pos3D = this.coordinatesToPosition(position);
        
        // Animar esfera
        this.animateSphere(this.spheres.soller, pos3D);
        
        // Atualizar displays
        this.updatePositionDisplay(position);
        this.updateProximityDisplay();
        this.updateTradeOffsDisplay();
        this.updateSlidersFromPosition(position);
        
        // Atualizar conexões
        this.updateConnections();
    }

    animateSphere(sphere, targetPosition) {
    if (!sphere || !sphere.position) {
        console.warn('Sphere não inicializada ainda');
        return;
    }
    
    // Se for a Soller, animar o grupo inteiro
    const target = this.sollerGroup || sphere;
    
    const duration = 1000;
    const start = performance.now();
    const startPos = target.position.clone();
    
    const animate = (time) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);
        
        target.position.lerpVectors(startPos, targetPosition, eased);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

toggleSollerAlwaysVisible() {
    if (!this.spheres.soller) return;
    
    const material = this.spheres.soller.material;
    const currentDepthTest = material.depthTest;
    
    // Toggle depthTest
    material.depthTest = !currentDepthTest;
    material.depthWrite = !currentDepthTest;
    
    // Feedback visual
    if (!material.depthTest) {
        // Modo "sempre visível" - adicionar brilho
        material.emissiveIntensity = 0.2;
        console.log('🦄 Soller: Modo X-Ray ativado');
    } else {
        // Modo normal
        material.emissiveIntensity = 0.2;
        console.log('🦄 Soller: Modo normal');
    }
}

    animateSollerToPosition(coordinates) {
        if (!this.spheres || !this.spheres.soller) {
            console.warn('Soller sphere não inicializada ainda');
            return;
        }
        
        const pos3D = this.coordinatesToPosition(coordinates);
        this.animateSphere(this.spheres.soller, pos3D);
        this.updatePositionDisplay(coordinates);
        this.updateProximityDisplay();
        this.updateTradeOffsDisplay();
        this.updateConnections();
    }

toggleFullScreen() {
    if (!this.container) return;

    const modalContent = this.container.closest('.unicorn-modal-content');
    if (!modalContent) return;

    const isFullScreen = modalContent.classList.contains('full-screen');
    
    if (isFullScreen) {
        // Saindo do fullscreen
        modalContent.classList.remove('full-screen');
        localStorage.removeItem('matrixWasFullScreen');
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    } else {
        // Entrando em fullscreen
        modalContent.classList.add('full-screen');
        localStorage.setItem('matrixWasFullScreen', 'true');
        
        // Esconder scroll do body
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    this.onWindowResize();

    // Atualizar ícones
    const expandIcon = modalContent.querySelector('.modal-expand .material-icons');
    if (expandIcon) {
        expandIcon.textContent = isFullScreen ? 'fullscreen' : 'fullscreen_exit';
    }
    
    const sidebarFullscreenBtn = document.querySelector('.sidebar-fullscreen-toggle .material-icons');
    if (sidebarFullscreenBtn) {
        sidebarFullscreenBtn.textContent = isFullScreen ? 'fullscreen' : 'fullscreen_exit';
    }
}

    updateConnections() {
    if (!this.scene || !this.spheres || !this.spheres.soller || !MatrixEngine) return;
    
    // Remover conexões antigas
    this.connections.forEach(line => {
        if (line && line.geometry) line.geometry.dispose();
        if (line && line.material) line.material.dispose();
        this.scene.remove(line);
    });
    this.connections = [];
    
    // Criar novas conexões com dados completos
    const nearest = MatrixEngine.findNearestUnicorns();
    if (nearest && nearest.length > 0) {
        nearest.forEach((unicorn, index) => {
            if (this.spheres[unicorn.key]) {
                const baseOpacity = 1 - (index / nearest.length);
                const line = this.createConnection(
                    this.spheres.soller.position,
                    this.spheres[unicorn.key].position,
                    unicorn.color,
                    baseOpacity * 0.6,
                    unicorn // Passar dados completos do unicórnio
                );
                this.scene.add(line);
                this.connections.push(line);
            }
        });
    }
}

    toggleHeader() {
    const header = this.container.querySelector('.modal-header');
    if (!header) return;
    
    header.classList.toggle('retracted');
    
    const toggleBtn = this.container.querySelector('.modal-header-toggle-btn');
    if (toggleBtn) {
        toggleBtn.classList.toggle('retracted', header.classList.contains('retracted'));
        const icon = toggleBtn.querySelector('.material-icons');
        if (icon) {
            icon.textContent = header.classList.contains('retracted') ? 'expand_more' : 'expand_less';
        }
    }
}

    createConnection(start, end, color, opacity, unicornData = null) {
    const points = [];
    const segments = 50;
    
    // Criar curva mais suave
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const height = Math.sin(t * Math.PI) * 2;
        const point = new THREE.Vector3().lerpVectors(start, end, t);
        point.y += height;
        points.push(point);
    }
    
    // Calcular grossura baseada em B2B Focus
    let lineWidth = 1;
    if (unicornData && MatrixEngine) {
        const sollerB2B = MatrixEngine.sollerPosition.b2bFocus;
        const unicornB2B = unicornData.coordinates.b2bFocus;
        const alignment = 1 - Math.abs(sollerB2B - unicornB2B) / 100;
        lineWidth = 0.5 + alignment * 2.5; // 0.5 a 3.0
    }
    
    // Calcular opacidade baseada em Scale
    const scaleOpacity = MatrixEngine ? (MatrixEngine.sollerPosition.scale / 100) : 0.5;
    const finalOpacity = opacity * scaleOpacity;
    
    // Criar linha com gradiente
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: color,
        transparent: true,
        opacity: finalOpacity,
        linewidth: lineWidth,
        dashSize: 3,
        gapSize: 1
    });
    
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    
    return line;
}
    updatePositionDisplay(position) {
    const container = document.getElementById('currentPosition');
    if (!container || !MatrixData) return;
    
    container.innerHTML = '';
    
    // Criar sliders funcionais para cada dimensão
    Object.entries(MatrixData.dimensions).forEach(([key, dim]) => {
        const value = Math.round(position[key]);
        
        const control = document.createElement('div');
        control.className = 'position-metric slider-control';
        control.innerHTML = `
            <div class="label">${dim.icon} ${dim.name}</div>
            <div class="slider-with-value">
                <input type="range" 
                       class="dimension-slider" 
                       id="dim-slider-${key}"
                       min="0" 
                       max="100" 
                       value="${value}"
                       data-dimension="${key}"
                       style="flex: 1;">
                <div class="slider-value-display" id="dim-value-${key}">${value}%</div>
            </div>
            <div class="axis-bar">
                <div class="axis-fill" id="axis-fill-${key}" style="width: ${value}%"></div>
            </div>
        `;
        container.appendChild(control);
        
        // CRUCIAL: Adicionar o event listener!
        const slider = control.querySelector('.dimension-slider');
        slider.addEventListener('input', (e) => {
            this.onSliderChange(e);
            // Atualizar displays em tempo real
            const newValue = e.target.value;
            document.getElementById(`dim-value-${key}`).textContent = `${Math.round(newValue)}%`;
            document.getElementById(`axis-fill-${key}`).style.width = `${newValue}%`;
        });
    });
}

    updateProximityDisplay() {
        const container = document.getElementById('proximityList');
        if (!container || !MatrixEngine) return;
        
        const nearest = MatrixEngine.findNearestUnicorns();
        if (nearest && nearest.length > 0) {
            container.innerHTML = nearest.map(unicorn => `
                <div class="proximity-item" style="border-left-color: ${unicorn.color}">
                    <span class="unicorn-name" style="color: ${unicorn.color}">${unicorn.name}</span>
                    <span class="match-percent">${unicorn.similarity}% match</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="no-data">Calculando proximidade...</div>';
        }
    }

    updateTradeOffsDisplay() {
        const container = document.getElementById('tradeoffsList');
        if (!container || !MatrixEngine) return;
        
        const optimal = MatrixEngine ? MatrixEngine.findOptimalPath() : null;
        if (!optimal) return;
        
        const tradeoffs = MatrixEngine.calculateTradeOffs(MatrixEngine.sollerPosition, optimal.position);
        
        if (tradeoffs && tradeoffs.length > 0) {
            container.innerHTML = tradeoffs.slice(0, 5).map(tradeoff => `
                <div class="tradeoff-item ${tradeoff.type}">
                    <div class="tradeoff-label">
                        ${tradeoff.dimension}: ${tradeoff.from.toFixed(0)}% → ${tradeoff.to.toFixed(0)}%
                    </div>
                    <div class="tradeoff-impact">
                        Custo: R$ ${(tradeoff.impact.cost/1000).toFixed(0)}k | 
                        Tempo: ${tradeoff.impact.time.toFixed(1)} meses
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="no-data">Calculando trade-offs...</div>';
        }
    }

    updateSlidersFromPosition(position) {
        if (!position) return;
        
        Object.entries(position).forEach(([key, value]) => {
            const slider = document.getElementById(`dim-slider-${key}`);
            const display = document.getElementById(`dim-value-${key}`);
            if (slider) slider.value = value;
            if (display) display.textContent = `${value.toFixed(0)}%`;
        });
    }

    syncToForecast(params) {
        if (!params) return;
        
        // Sincronizar com o sistema de forecast
        if (window.projectionCalculator && window.projectionCalculator.parameters) {
            Object.assign(window.projectionCalculator.parameters, params);
            
            // Atualizar UI dos parâmetros
            if (typeof window.updateUIFromParameters === 'function') {
                window.updateUIFromParameters(params);
            }
            
            // Recalcular projeções
            if (typeof window.recalculateProjections === 'function') {
                window.recalculateProjections();
            }
            
            // Indicar mudança no botão
            const unicornBtn = document.querySelector('.floating-unicorn-button');
            if (unicornBtn) {
                unicornBtn.classList.add('active');
                setTimeout(() => unicornBtn.classList.remove('active'), 2000);
            }
        } else {
            console.warn('Sistema de forecast não disponível');
        }
    }

    syncToForecastDrag(position) {
        if (!MatrixEngine) return;
        
        // Converter posição 3D para coordenadas 5D
        const coordinates = this.positionToCoordinates(position);
        
        // Atualizar engine
        MatrixEngine.sollerPosition = coordinates;
        
        // Converter para parâmetros de projeção
        const params = MatrixEngine.positionToProjectionParams(coordinates);
        
        // Sincronizar com forecast
        this.syncToForecast(params);
    }

    syncFromForecast(params) {
        if (!params || !this.isInitialized) {
            console.warn('Sistema não inicializado ou parâmetros inválidos');
            return;
        }
        
        // Atualizar posição baseada nos parâmetros
        const newPosition = MatrixEngine.updateFromProjectionParams(params);
        
        // Animar visualização
        this.animateSollerToPosition(newPosition);
        
        // Atualizar displays
        this.updateSlidersFromPosition(newPosition);
        this.updatePositionDisplay(newPosition);
        this.updateProximityDisplay();
        this.updateTradeOffsDisplay();
    }

    onWindowResize() {
    if (!this.camera || !this.renderer || !this.container) return;
    
    // Forçar recálculo do tamanho do container
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.clientWidth;
    const height = rect.height || this.container.clientHeight;
    
    if (width > 0 && height > 0) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
}

    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // Atualizar controles
        if (this.controls) {
            this.controls.update();
        }
        
        // Animar anéis pulsantes
        if (this.spheres && this.spheres.soller && this.spheres.soller.children) {
            this.spheres.soller.children.forEach((child, index) => {
                if (child && child.userData && child.userData.pulsePhase !== undefined && child.material) {
                    const scale = 1 + Math.sin(Date.now() * 0.001 + child.userData.pulsePhase) * 0.1;
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 0.3 - index * 0.1 - Math.sin(Date.now() * 0.001 + child.userData.pulsePhase) * 0.1;
                }
            });
        }
        
        // Rotacionar anéis orbitais
        if (this.spheres) {
            Object.values(this.spheres).forEach(sphere => {
                if (sphere && sphere.children) {
                    sphere.children.forEach(child => {
                        if (child && child.geometry && child.geometry.type === 'TorusGeometry') {
                            child.rotation.z += 0.01;
                        }
                    });
                }
            });
        }

        this.updateSpheresOpacity();
        
        // Renderizar
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    findOptimalPath() {
        if (!this.isInitialized || !MatrixEngine) {
            console.warn('Sistema não inicializado completamente');
            return;
        }
        
        const result = MatrixEngine.findOptimalPath();
        
        if (!result) {
            console.warn('Não foi possível calcular caminho ótimo');
            return;
        }
        
        // Criar visualização do caminho ótimo
        this.showOptimalPath(result);
        
        // Animar Soller para posição ótima
        if (result.position) {
            this.animateSollerToPosition(result.position);
        }
        
        // Atualizar painéis informativos
        this.updateOptimalPathInfo(result);
        
        // Mostrar análise de investimento
        this.showInvestmentAnalysis(result);
    }
    
    showOptimalPath(result) {
        if (!this.scene) {
            console.warn('Scene não inicializada');
            return;
        }
        
        // Remover path anterior se existir
        if (this.optimalPathLine) {
            this.scene.remove(this.optimalPathLine);
        }
        
        // Criar linha do caminho ótimo
        if (!MatrixEngine || !result.position) return;
        
        const currentPos = this.coordinatesToPosition(MatrixEngine.sollerPosition);
        const optimalPos = this.coordinatesToPosition(result.position);
        
        const points = [];
        const segments = 100;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const eased = this.easeInOutCubic(t);
            
            const point = new THREE.Vector3().lerpVectors(currentPos, optimalPos, eased);
            // Adicionar ondulação para visualização mais interessante
            const wave = Math.sin(t * Math.PI * 4) * 0.5;
            point.y += wave * (1 - Math.abs(t - 0.5) * 2);
            
            points.push(point);
        }
        
        const optimalColor = MatrixData?.visualization?.colors?.optimal || '#22c55e';
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(optimalColor),
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        
        this.optimalPathLine = new THREE.Line(geometry, material);
        this.scene.add(this.optimalPathLine);
        
        // Adicionar marcador no ponto ótimo
        this.createOptimalMarker(optimalPos);
    }
    
    createOptimalMarker(position) {
        if (!this.scene) {
            console.warn('Scene não inicializada');
            return;
        }
        
        if (this.optimalMarker) {
            this.scene.remove(this.optimalMarker);
        }
        
        const optimalColor = MatrixData?.visualization?.colors?.optimal || '#22c55e';
        
        const geometry = new THREE.OctahedronGeometry(0.3);
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(optimalColor),
            metalness: 0.8,
            roughness: 0.2,
            emissive: new THREE.Color(optimalColor),
            emissiveIntensity: 0.3
        });
        
        this.optimalMarker = new THREE.Mesh(geometry, material);
        this.optimalMarker.position.copy(position);
        this.scene.add(this.optimalMarker);
        
        // Animação de rotação do marcador
        const animateMarker = () => {
            if (this.optimalMarker) {
                this.optimalMarker.rotation.x += 0.02;
                this.optimalMarker.rotation.y += 0.03;
                requestAnimationFrame(animateMarker);
            }
        };
        animateMarker();
    }
    
    updateOptimalPathInfo(result) {
        // Criar card informativo sobre o caminho ótimo
        const infoContainer = document.getElementById('tradeoffsList');
        if (!infoContainer || !MatrixData) return;
        
        const optimalColor = MatrixData.visualization?.colors?.optimal || '#22c55e';
        
        const info = `
            <div class="optimal-path-info">
                <h5 style="color: ${optimalColor}">🎯 Caminho Ótimo Detectado</h5>
                <div class="path-metrics">
                    <div class="metric-item">
                        <span class="label">Valuation:</span>
                        <span class="value">R$ ${(result.estimatedValuation/1000000).toFixed(0)}M</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">Investimento Necessário:</span>
                        <span class="value">R$ ${(result.investment/1000000).toFixed(1)}M</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">Tempo Estimado:</span>
                        <span class="value">${result.timeRequired.toFixed(1)} meses</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">ROI Projetado:</span>
                        <span class="value">${((result.estimatedValuation - 60000000) / result.investment * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        `;
        
        infoContainer.innerHTML = info + infoContainer.innerHTML;
    }
    
    showInvestmentAnalysis(result) {
        if (!result || !MatrixEngine) return;
        
        // Análise detalhada do investimento necessário
        const tradeoffs = MatrixEngine.calculateTradeOffs(MatrixEngine.sollerPosition, result.position);
        
        if (!tradeoffs || tradeoffs.length === 0) {
            console.log('📊 Nenhum trade-off significativo identificado');
            return;
        }
        
        console.log('📊 Análise de Investimento - Path to Unicorn:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        tradeoffs.forEach(trade => {
            console.log(`${trade.dimension}: ${trade.from.toFixed(0)}% → ${trade.to.toFixed(0)}%`);
            console.log(`  💰 Custo: R$ ${(trade.impact.cost/1000).toFixed(0)}k`);
            console.log(`  ⏱️  Tempo: ${trade.impact.time.toFixed(1)} meses`);
            console.log(`  ⚠️  Risco: ${trade.impact.risk}`);
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`TOTAL: R$ ${(result.investment/1000000).toFixed(1)}M em ${result.timeRequired.toFixed(0)} meses`);
    }
    
    destroy() {

    if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
    }
    
    window.removeEventListener('resize', this.debouncedResize);
    document.removeEventListener('fullscreenchange', this.debouncedResize);
    document.removeEventListener('webkitfullscreenchange', this.debouncedResize);
    document.removeEventListener('mozfullscreenchange', this.debouncedResize);
    document.removeEventListener('MSFullscreenChange', this.debouncedResize);
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Parar animação
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }
    
    // Remover elementos DOM criados
    const floatingBtn = document.querySelector('.sidebar-toggle-floating');
    if (floatingBtn) {
        floatingBtn.classList.remove('visible');
    }
    
    const innerToggle = document.querySelector('.sidebar-inner-toggle');
    if (innerToggle) innerToggle.remove();
    
    // Limpar timeouts
    if (this.planeClickTimeout) {
        clearTimeout(this.planeClickTimeout);
        this.planeClickTimeout = null;
    }
    
    // Remover event listeners ANTES de destruir elementos
    if (this.renderer && this.renderer.domElement) {
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    const modalContent = this.container?.closest('.unicorn-modal-content');
    if (modalContent?.classList.contains('full-screen')) {
        localStorage.setItem('matrixWasFullScreen', 'true');
    }
    
    // Limpar Three.js
    if (this.scene) {
        this.scene.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        // Limpar cena
        while(this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
    }
    
    if (this.renderer) {
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
    
    // Limpar todas as referências
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.spheres = {};
    this.connections = [];
    this.labels = [];
    this.planes = {};
    this.planesClickCount = {};
    this.tooltip = null;
    this.container = null;
    this.isInitialized = false;
    this.isDragging = false;
    this.selectedObject = null;
    this.dragPlane = null;
}
}

// Inicialização e controle global
window.MatrixController = {
    instance: null,
    
    init() {
        // Sempre destruir instância anterior completamente
        if (this.instance) {
            try {
                this.instance.destroy();
                this.instance = null;
            } catch (e) {
                console.warn('Erro ao destruir:', e);
            }
        }
        
        // Pequeno delay para garantir limpeza
        setTimeout(() => {
            const container = document.getElementById('matrix3d-container');
            if (!container) {
                console.error('Container não encontrado');
                return;
            }
            
            // Limpar container
            container.innerHTML = '';
            
            this.instance = new StrategicMatrix3D();
            this.instance.init('matrix3d-container');
        }, 100);
    },
    
    findOptimalPath() {
        if (this.instance && this.instance.isInitialized) {
            this.instance.findOptimalPath();
        } else {
            console.warn('Matrix não inicializada ainda');
        }
    },
    
    syncFromForecast(params) {
        if (this.instance && this.instance.isInitialized) {
            this.instance.syncFromForecast(params);
        } else {
            console.warn('Matrix não inicializada ainda');
        }
    },

    toggleFullScreen() {
        if (this.instance && this.instance.isInitialized) {
            this.instance.toggleFullScreen();
        } else {
            console.warn('Matrix não inicializada ainda');
        }
    },

    toggleHeader() {
        if (this.instance && this.instance.isInitialized) {
            this.instance.toggleHeader();
        } else {
            console.warn('Matrix não inicializada ainda');
        }
    }
};

function toggleModalSize() {
  const modalContent = document.querySelector('.unicorn-modal-content');
  modalContent.classList.toggle('');
}

function toggleUnicornModal() {
    const modal = document.getElementById('unicornModal');
    const customPanelModal = document.getElementById('customPanelModal');
    const unicornBtn = document.querySelector('.floating-unicorn-button');
    
    if (!modal) return;
    
    const isActive = modal.classList.contains('active');
    
    if (isActive) {
        // Fechando o modal
        modal.classList.remove('active');
        unicornBtn.classList.remove('modal-active');
        
        // Destruir instância do 3D
        if (window.MatrixController && window.MatrixController.instance) {
            window.MatrixController.instance.destroy();
            window.MatrixController.instance = null;
        }
        
        // Limpar event listeners de transparência
        modal.removeEventListener('mouseenter', handleMouseInteraction);
        modal.removeEventListener('mouseleave', handleMouseInteraction);
        if (customPanelModal) {
            customPanelModal.removeEventListener('mouseenter', handleMouseInteraction);
            customPanelModal.removeEventListener('mouseleave', handleMouseInteraction);
        }
    } else {
        // Abrindo o modal
        modal.classList.add('active');
        unicornBtn.classList.add('modal-active');
        
        // Configurar transparência automática
        const handleMouseInteraction = () => {
            const isHoveringParams = customPanelModal && customPanelModal.matches(':hover');
            const isHoveringUnicorn = modal.matches(':hover');
            const modalContent = customPanelModal?.querySelector('.modal-content');
            
            if (modalContent) {
                if (!isHoveringParams && isHoveringUnicorn) {
                    modalContent.style.opacity = '0.1';
                    modalContent.style.transition = 'opacity 0.3s ease';
                } else {
                    modalContent.style.opacity = '1';
                }
            }
        };
        
        // Adicionar listeners
        modal.addEventListener('mouseenter', handleMouseInteraction);
        modal.addEventListener('mouseleave', handleMouseInteraction);
        if (customPanelModal) {
            customPanelModal.addEventListener('mouseenter', handleMouseInteraction);
            customPanelModal.addEventListener('mouseleave', handleMouseInteraction);
        }
        
        // Inicializar matrix com delay para garantir que o DOM está pronto
        setTimeout(() => {
            window.MatrixController.init();
        }, 100);
    }
}

// Substitua os antigos listeners por este novo
document.addEventListener('mousemove', (event) => {
    const unicornModal = document.getElementById('unicornModal');
    const customModal = document.getElementById('customPanelModal');

    if (!unicornModal || !customModal) return;

    const unicornContent = unicornModal.querySelector('.unicorn-modal-content');
    const customContent = customModal.querySelector('.modal-content');

    const isUnicornActive = unicornModal.classList.contains('active');
    const isCustomActive = customModal.classList.contains('active');

    if (isUnicornActive && unicornContent) {
        const rect = unicornContent.getBoundingClientRect();
        const isInside = event.clientX >= rect.left &&
                         event.clientX <= rect.right &&
                         event.clientY >= rect.top &&
                         event.clientY <= rect.bottom;

        unicornContent.style.opacity = isInside ? '1' : '0.0001';
        unicornContent.style.transition = 'opacity 0.3s ease';
    }

    if (isCustomActive && customContent) {
        const rect = customContent.getBoundingClientRect();
        const isInside = event.clientX >= rect.left &&
                         event.clientX <= rect.right &&
                         event.clientY >= rect.top &&
                         event.clientY <= rect.bottom;

        customContent.style.opacity = isInside ? '1' : '0.0001';
        customContent.style.transition = 'opacity 0.3s ease';
    }
});

// Hook para sincronização com forecast quando parâmetros mudam
if (window.addEventListener) {
    window.addEventListener('forecastUpdated', (event) => {
        try {
            if (MatrixController.instance && event.detail) {
                MatrixController.syncFromForecast(event.detail);
            }
        } catch(e) {
            console.warn('Erro ao sincronizar com forecast:', e);
        }
    });
}

document.addEventListener('keydown', (event) => {
  const unicornModal = document.getElementById('unicornModal');
  const isModalActive = unicornModal.classList.contains('active');
  const isFullscreen = unicornModal.classList.contains('fullscreen');

  // Verifica se o modal está ativo e se a tecla 'Esc' foi pressionada
  if (isModalActive && event.key === 'Escape') {
    // Se estiver em tela cheia, volta para o tamanho normal
    if (isFullscreen) {
      toggleModalSize();
    } else {
      // Se estiver no tamanho normal, fecha o modal
      toggleUnicornModal();
    }
  }
});

// Export para uso global
window.StrategicMatrix3D = StrategicMatrix3D;
