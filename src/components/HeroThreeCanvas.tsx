import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  ArrowClockwise,
  LockKey,
  LockKeyOpen,
  X,
  ShieldWarning,
  MagnifyingGlass,
  Lightning,
  Pulse,
  ClockCounterClockwise,
  ShieldCheck,
  CaretRight,
  CaretLeft,
  CheckCircle,
  TerminalWindow,
  Desktop,
  Cpu,
  HardDrives
} from '@phosphor-icons/react';
import {
  INCIDENT_RESPONSE_STAGES,
  IncidentResponseStage
} from '../data/incidentResponseStages';


interface HeroThreeCanvasProps {
  className?: string;
  isZoomedIn?: boolean;
  onToggleZoom?: () => void;
}

export const HeroThreeCanvas: React.FC<HeroThreeCanvasProps> = ({
  className = '',
  isZoomedIn = false,
  onToggleZoom
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cardKey, setCardKey] = useState<number>(0);

  // Synchronized refs for Three.js render loop
  const stageRef = useRef<number>(0);
  stageRef.current = currentStageIndex;

  const isZoomedInRef = useRef<boolean>(false);
  isZoomedInRef.current = isZoomedIn;

  // Camera transition choreography refs
  const cameraTransitionRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    startLookAt: THREE.Vector3;
    targetPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    arcOffset: THREE.Vector3;
    startTime: number;
    duration: number;
  }>({
    active: false,
    startPos: new THREE.Vector3(0, 13, 32),
    startLookAt: new THREE.Vector3(0, 0, 0),
    targetPos: new THREE.Vector3(8.5, 6.2, 14.5),
    targetLookAt: new THREE.Vector3(0, 0.4, 0),
    arcOffset: new THREE.Vector3(2, 3, 2),
    startTime: 0,
    duration: 1.8
  });

  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Switch stage with camera transition
  const navigateToStage = useCallback((newIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(INCIDENT_RESPONSE_STAGES.length - 1, newIndex));
    setCurrentStageIndex(clampedIndex);
    setCardKey((prev) => prev + 1);

    const targetStage = INCIDENT_RESPONSE_STAGES[clampedIndex];
    if (cameraTransitionRef.current) {
      cameraTransitionRef.current.active = true;
      cameraTransitionRef.current.startTime = performance.now() * 0.001;
      cameraTransitionRef.current.targetPos.set(...targetStage.camera.pos);
      cameraTransitionRef.current.targetLookAt.set(...targetStage.camera.lookAt);
      cameraTransitionRef.current.arcOffset.set(...targetStage.camera.arcOffset);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStageIndex < INCIDENT_RESPONSE_STAGES.length - 1) {
      navigateToStage(currentStageIndex + 1);
    } else {
      // Loop back to beginning for restart
      navigateToStage(0);
    }
  }, [currentStageIndex, navigateToStage]);

  const handlePrev = useCallback(() => {
    if (currentStageIndex > 0) {
      navigateToStage(currentStageIndex - 1);
    }
  }, [currentStageIndex, navigateToStage]);

  const handleRestart = useCallback(() => {
    navigateToStage(0);
  }, [navigateToStage]);

  // Optional auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        const next = (prev + 1) % INCIDENT_RESPONSE_STAGES.length;
        const targetStage = INCIDENT_RESPONSE_STAGES[next];
        if (cameraTransitionRef.current) {
          cameraTransitionRef.current.active = true;
          cameraTransitionRef.current.startTime = performance.now() * 0.001;
          cameraTransitionRef.current.targetPos.set(...targetStage.camera.pos);
          cameraTransitionRef.current.targetLookAt.set(...targetStage.camera.lookAt);
          cameraTransitionRef.current.arcOffset.set(...targetStage.camera.arcOffset);
        }
        setCardKey((k) => k + 1);
        return next;
      });
    }, 6500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync camera when zoom-in state toggles
  useEffect(() => {
    const targetStage = INCIDENT_RESPONSE_STAGES[currentStageIndex];
    if (cameraTransitionRef.current) {
      cameraTransitionRef.current.active = true;
      cameraTransitionRef.current.startTime = performance.now() * 0.001;
      if (isZoomedIn) {
        cameraTransitionRef.current.targetPos.set(...targetStage.camera.pos);
        cameraTransitionRef.current.targetLookAt.set(...targetStage.camera.lookAt);
        cameraTransitionRef.current.arcOffset.set(...targetStage.camera.arcOffset);
      } else {
        cameraTransitionRef.current.targetPos.set(0, 13, 32);
        cameraTransitionRef.current.targetLookAt.set(0, 0, 0);
        cameraTransitionRef.current.arcOffset.set(0, 2, 0);
      }
    }
  }, [isZoomedIn, currentStageIndex]);

  // Helper to create holographic canvas textures in WebGL
  const createHoloCanvasTexture = (
    badgeText: string,
    titleText: string,
    telemetryLines: string[],
    accentColor: string
  ): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(44, 7, 18, 0.94)';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = '#5C1D2D';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 508, 252);

      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, 512, 6);

      ctx.strokeStyle = 'rgba(216, 203, 181, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 14; y < 256; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(badgeText.toUpperCase(), 24, 38);

      ctx.fillStyle = '#FAF6EE';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(titleText, 24, 74);

      ctx.strokeStyle = 'rgba(216, 203, 181, 0.25)';
      ctx.beginPath();
      ctx.moveTo(24, 92);
      ctx.lineTo(488, 92);
      ctx.stroke();

      ctx.fillStyle = '#D8CBB5';
      ctx.font = '14px monospace';
      telemetryLines.forEach((line, idx) => {
        ctx.fillText(line, 24, 126 + idx * 30);
      });
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js Scene Setup with atmospheric deep burgundy background
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x2C0712, 0.014);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 13, 32);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization error', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Architectural Lighting in warm antique ivory tones
    const ambientLight = new THREE.AmbientLight(0xD8CBB5, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFF6EA, 2.3);
    dirLight.position.set(18, 32, 22);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xD8CBB5, 2.4, 55);
    accentLight.position.set(-8, 11, 7);
    scene.add(accentLight);

    // Dynamic Alert Red Emergency Point Light (Stage 1 & 2)
    const alertLight = new THREE.PointLight(0xE05A47, 0, 35);
    alertLight.position.set(0, 6, 0);
    scene.add(alertLight);

    // Dynamic Recovery Green Light (Stage 5)
    const recoveryLight = new THREE.PointLight(0x52B788, 0, 40);
    recoveryLight.position.set(0, 7, 0);
    scene.add(recoveryLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Ground Cyber Coordinate Grid
    const gridHelper = new THREE.GridHelper(42, 28, 0xD8CBB5, 0x4C1222);
    gridHelper.position.y = -3.8;
    rootGroup.add(gridHelper);

    // Concentric Perimeter Rings on the ground
    [8, 14, 21].forEach((radius) => {
      const ringGeom = new THREE.RingGeometry(radius - 0.04, radius + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xD8CBB5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -3.78;
      rootGroup.add(ringMesh);
    });

    // 1. Architecture Node Data (Monoliths)
    const nodeConfigs = [
      { id: 'gateway', x: 0, y: 0.3, z: 0, w: 2.8, h: 4.6, d: 2.8, isTarget: true, label: 'Core Gateway' },
      { id: 'auth', x: -7.8, y: -0.3, z: -3.8, w: 2.1, h: 3.4, d: 2.1, isTarget: false, label: 'Identity SSO' },
      { id: 'db-primary', x: 7.8, y: -0.1, z: -3.5, w: 2.3, h: 3.8, d: 2.3, isTarget: false, label: 'Ledger DB' },
      { id: 'waf-edge', x: -6.4, y: 0.9, z: 5.4, w: 1.9, h: 3.0, d: 1.9, isTarget: false, label: 'Edge Proxy' },
      { id: 'vault', x: 6.6, y: 0.7, z: 5.2, w: 2.2, h: 3.5, d: 2.2, isTarget: false, label: 'HSM Vault' },
      { id: 'k8s-pod', x: 0.2, y: -1.0, z: -8.2, w: 2.0, h: 2.6, d: 2.0, isTarget: false, label: 'Compute Engine' },
      { id: 'sentinel', x: 9.0, y: 1.3, z: 1.2, w: 1.7, h: 2.4, d: 1.7, isTarget: false, label: 'AI Sentinel' }
    ];

    interface NodeMeshItem {
      mesh: THREE.Mesh;
      wire: THREE.LineSegments;
      halo?: THREE.Mesh;
      baseColor: number;
      isTarget: boolean;
      config: (typeof nodeConfigs)[0];
    }

    const nodeMeshes: NodeMeshItem[] = [];

    nodeConfigs.forEach((cfg) => {
      const geom = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.isTarget ? 0x4C1222 : 0x2C0712,
        roughness: 0.28,
        metalness: 0.72
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      rootGroup.add(mesh);

      const edgesGeom = new THREE.EdgesGeometry(geom);
      const edgesMat = new THREE.LineBasicMaterial({
        color: cfg.isTarget ? 0xFAF6EE : 0xD8CBB5,
        linewidth: 1,
        transparent: true,
        opacity: 0.88
      });
      const wire = new THREE.LineSegments(edgesGeom, edgesMat);
      mesh.add(wire);

      const baseGeom = new THREE.BoxGeometry(cfg.w + 0.6, 0.25, cfg.d + 0.6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x20050D,
        roughness: 0.4,
        metalness: 0.8
      });
      const baseMesh = new THREE.Mesh(baseGeom, baseMat);
      baseMesh.position.y = -cfg.h / 2 - 0.12;
      mesh.add(baseMesh);

      // Node base halo
      const haloGeom = new THREE.RingGeometry(cfg.w * 0.8, cfg.w * 1.1, 36);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xD8CBB5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.y = -cfg.h / 2 + 0.05;
      rootGroup.add(halo);

      nodeMeshes.push({
        mesh,
        wire,
        halo,
        baseColor: cfg.isTarget ? 0x4C1222 : 0x2C0712,
        isTarget: cfg.isTarget,
        config: cfg
      });
    });

    // 2. Interconnecting Conduits
    const connections: [number, number][] = [
      [0, 1], // gateway to auth
      [0, 2], // gateway to db-primary
      [0, 3], // gateway to waf-edge
      [0, 4], // gateway to vault
      [1, 5], // auth to compute
      [2, 5], // db-primary to compute
      [3, 1], // waf to auth
      [4, 2], // vault to db
      [2, 6], // db to sentinel
      [4, 6]  // vault to sentinel
    ];

    interface ConduitItem {
      line: THREE.Line;
      material: THREE.LineBasicMaterial;
      start: THREE.Vector3;
      end: THREE.Vector3;
      touchesTarget: boolean;
    }

    const conduits: ConduitItem[] = [];

    connections.forEach(([fromIdx, toIdx]) => {
      const fromCfg = nodeConfigs[fromIdx];
      const toCfg = nodeConfigs[toIdx];
      const start = new THREE.Vector3(fromCfg.x, fromCfg.y, fromCfg.z);
      const end = new THREE.Vector3(toCfg.x, toCfg.y, toCfg.z);

      const points = [start, end];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xD8CBB5,
        transparent: true,
        opacity: 0.65,
        linewidth: 1
      });
      const line = new THREE.Line(geom, mat);
      rootGroup.add(line);

      conduits.push({
        line,
        material: mat,
        start,
        end,
        touchesTarget: fromCfg.isTarget || toCfg.isTarget
      });
    });

    // 3. Flowing Data Particles along conduits
    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleConduits = new Int32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeeds[i] = 0.0022 + Math.random() * 0.0035;
      particleConduits[i] = Math.floor(Math.random() * conduits.length);
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xFAF6EE,
      size: 0.55,
      transparent: true,
      opacity: 0.95
    });
    const particlesMesh = new THREE.Points(particleGeom, particleMat);
    rootGroup.add(particlesMesh);

    // ==========================================
    // STAGE 01: Threat Detected 3D Assets
    // ==========================================
    // Red alert beacon pyramid over gateway
    const beaconGeom = new THREE.ConeGeometry(0.9, 1.8, 4);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xE05A47,
      wireframe: true,
      transparent: true,
      opacity: 0
    });
    const alertBeacon = new THREE.Mesh(beaconGeom, beaconMat);
    alertBeacon.position.set(0, 4.4, 0);
    rootGroup.add(alertBeacon);

    // Expanding threat wave rings
    const threatRingGeom = new THREE.RingGeometry(1.6, 2.0, 36);
    const threatRingMat = new THREE.MeshBasicMaterial({
      color: 0xE05A47,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const threatRing = new THREE.Mesh(threatRingGeom, threatRingMat);
    threatRing.rotation.x = Math.PI / 2;
    threatRing.position.set(0, -2.2, 0);
    rootGroup.add(threatRing);

    // Red chaotic threat particles
    const threatPCount = 45;
    const threatPPositions = new Float32Array(threatPCount * 3);
    const threatPAngles = new Float32Array(threatPCount);
    const threatPSpeeds = new Float32Array(threatPCount);
    for (let i = 0; i < threatPCount; i++) {
      threatPAngles[i] = Math.random() * Math.PI * 2;
      threatPSpeeds[i] = 0.02 + Math.random() * 0.04;
    }
    const threatPGeom = new THREE.BufferGeometry();
    threatPGeom.setAttribute('position', new THREE.BufferAttribute(threatPPositions, 3));
    const threatPMat = new THREE.PointsMaterial({
      color: 0xE05A47,
      size: 0.45,
      transparent: true,
      opacity: 0
    });
    const threatPMesh = new THREE.Points(threatPGeom, threatPMat);
    rootGroup.add(threatPMesh);

    // ==========================================
    // STAGE 02: Holographic Investigation Panels
    // ==========================================
    const holoPanelGroup = new THREE.Group();
    rootGroup.add(holoPanelGroup);

    // Panel 1: Ingress packet logs
    const tex1 = createHoloCanvasTexture(
      'INGRESS TELEMETRY',
      'Port 443 / Unauthorized Handshake',
      ['SRC: 198.51.100.44 -> DST: EdgeProxy', 'METHOD: POST /api/v2/auth/token', 'SIGNATURE: Suspicious Token Spraying'],
      '#D8CBB5'
    );
    const holoMat1 = new THREE.MeshBasicMaterial({ map: tex1, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const holoMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), holoMat1);
    holoMesh1.position.set(-4.2, 3.8, 4.2);
    holoMesh1.rotation.y = 0.35;
    holoPanelGroup.add(holoMesh1);

    // Panel 2: Asset Profile & Severity
    const tex2 = createHoloCanvasTexture(
      'ASSET PROFILE',
      'Core Gateway : CVSS 8.9 High',
      ['HOST: gateway-prod-01.us-east', 'IMPACT: Identity SSO & Vault Ingress', 'STATUS: Uncontained Anomaly'],
      '#E05A47'
    );
    const holoMat2 = new THREE.MeshBasicMaterial({ map: tex2, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const holoMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), holoMat2);
    holoMesh2.position.set(3.8, 3.4, 3.8);
    holoMesh2.rotation.y = -0.38;
    holoPanelGroup.add(holoMesh2);

    // Diagnostic reticle scanning rings
    const diagReticleGeom = new THREE.TorusGeometry(3.4, 0.05, 16, 48);
    const diagReticleMat = new THREE.MeshBasicMaterial({
      color: 0xD8CBB5,
      transparent: true,
      opacity: 0
    });
    const diagReticle = new THREE.Mesh(diagReticleGeom, diagReticleMat);
    diagReticle.rotation.x = Math.PI / 2;
    diagReticle.position.set(0, 0.5, 0);
    rootGroup.add(diagReticle);

    // ==========================================
    // STAGE 03: Containment Hexagonal Forcefield
    // ==========================================
    const barrierGeom = new THREE.CylinderGeometry(3.8, 3.8, 6.2, 6, 1, true);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x3F0D1B,
      transparent: true,
      opacity: 0,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide
    });
    const barrierMesh = new THREE.Mesh(barrierGeom, barrierMat);
    barrierMesh.position.set(0, 0.3, 0);
    rootGroup.add(barrierMesh);

    const barrierWireGeom = new THREE.EdgesGeometry(barrierGeom);
    const barrierWireMat = new THREE.LineBasicMaterial({
      color: 0xF59E0B,
      transparent: true,
      opacity: 0
    });
    const barrierWire = new THREE.LineSegments(barrierWireGeom, barrierWireMat);
    barrierMesh.add(barrierWire);

    // Isolation Pylons at 4 barrier corners
    const pylonGroup = new THREE.Group();
    rootGroup.add(pylonGroup);
    const pylonGeom = new THREE.CylinderGeometry(0.12, 0.12, 5.5, 8);
    const pylonMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0 });
    [[-3.8, 0], [3.8, 0], [0, -3.8], [0, 3.8]].forEach(([px, pz]) => {
      const pMesh = new THREE.Mesh(pylonGeom, pylonMat);
      pMesh.position.set(px, 0.4, pz);
      pylonGroup.add(pMesh);
    });

    // ==========================================
    // STAGE 04: Eradication Laser Sweep
    // ==========================================
    const sweepPlaneGeom = new THREE.PlaneGeometry(5.2, 5.2);
    const sweepPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xD8CBB5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const sweepPlane = new THREE.Mesh(sweepPlaneGeom, sweepPlaneMat);
    sweepPlane.rotation.x = Math.PI / 2;
    sweepPlane.position.set(0, 0, 0);
    rootGroup.add(sweepPlane);

    // Purge sparks bursting outward
    const purgePCount = 60;
    const purgePPositions = new Float32Array(purgePCount * 3);
    const purgePVelocities = new Float32Array(purgePCount * 3);
    for (let i = 0; i < purgePCount; i++) {
      purgePVelocities[i * 3] = (Math.random() - 0.5) * 0.12;
      purgePVelocities[i * 3 + 1] = Math.random() * 0.14;
      purgePVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    const purgePGeom = new THREE.BufferGeometry();
    purgePGeom.setAttribute('position', new THREE.BufferAttribute(purgePPositions, 3));
    const purgePMat = new THREE.PointsMaterial({
      color: 0xFAF6EE,
      size: 0.5,
      transparent: true,
      opacity: 0
    });
    const purgePMesh = new THREE.Points(purgePGeom, purgePMat);
    rootGroup.add(purgePMesh);

    // ==========================================
    // STAGE 05: System Recovery Beams & Halos
    // ==========================================
    const recoveryGroup = new THREE.Group();
    rootGroup.add(recoveryGroup);

    // Clean restore energy lines between Vault, DB, and Gateway
    const restorePoints1 = [new THREE.Vector3(6.6, 1.5, 5.2), new THREE.Vector3(3.3, 3.5, 2.6), new THREE.Vector3(0, 1.8, 0)];
    const restoreCurve1 = new THREE.CatmullRomCurve3(restorePoints1);
    const restoreLineGeom1 = new THREE.TubeGeometry(restoreCurve1, 32, 0.08, 8, false);
    const restoreMat1 = new THREE.MeshBasicMaterial({ color: 0x52B788, transparent: true, opacity: 0 });
    const restoreMesh1 = new THREE.Mesh(restoreLineGeom1, restoreMat1);
    recoveryGroup.add(restoreMesh1);

    const restorePoints2 = [new THREE.Vector3(7.8, 1.5, -3.5), new THREE.Vector3(3.9, 3.2, -1.8), new THREE.Vector3(0, 1.8, 0)];
    const restoreCurve2 = new THREE.CatmullRomCurve3(restorePoints2);
    const restoreLineGeom2 = new THREE.TubeGeometry(restoreCurve2, 32, 0.08, 8, false);
    const restoreMat2 = new THREE.MeshBasicMaterial({ color: 0x52B788, transparent: true, opacity: 0 });
    const restoreMesh2 = new THREE.Mesh(restoreLineGeom2, restoreMat2);
    recoveryGroup.add(restoreMesh2);

    // ==========================================
    // STAGE 06: Post-Incident Review Timeline Axis
    // ==========================================
    const timelineGroup = new THREE.Group();
    rootGroup.add(timelineGroup);

    // Ground timeline guide rail
    const timelineRailGeom = new THREE.BoxGeometry(20, 0.1, 0.3);
    const timelineRailMat = new THREE.MeshBasicMaterial({ color: 0xD8CBB5, transparent: true, opacity: 0 });
    const timelineRail = new THREE.Mesh(timelineRailGeom, timelineRailMat);
    timelineRail.position.set(0, -3.2, 5.5);
    timelineGroup.add(timelineRail);

    // Milestone markers along timeline
    const milestonePositions = [-8, -4, 0, 4, 8];
    const milestoneBeacons: THREE.Mesh[] = [];
    milestonePositions.forEach((mx) => {
      const pylonMGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16);
      const pylonMMat = new THREE.MeshBasicMaterial({ color: 0xD8CBB5, transparent: true, opacity: 0 });
      const mMesh = new THREE.Mesh(pylonMGeom, pylonMMat);
      mMesh.position.set(mx, -2.1, 5.5);
      timelineGroup.add(mMesh);
      milestoneBeacons.push(mMesh);

      // Milestone light cap
      const capGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const capMat = new THREE.MeshBasicMaterial({ color: 0xFAF6EE, transparent: true, opacity: 0 });
      const capMesh = new THREE.Mesh(capGeom, capMat);
      capMesh.position.y = 1.1;
      mMesh.add(capMesh);
    });

    // ==========================================
    // STAGE 07: Security Reinforcement Defense Dome
    // ==========================================
    const defenseDomeGeom = new THREE.IcosahedronGeometry(17, 2);
    const defenseDomeWire = new THREE.WireframeGeometry(defenseDomeGeom);
    const defenseDomeMat = new THREE.LineBasicMaterial({
      color: 0xD8CBB5,
      transparent: true,
      opacity: 0,
      linewidth: 1
    });
    const defenseDome = new THREE.LineSegments(defenseDomeWire, defenseDomeMat);
    defenseDome.position.set(0, 2, 0);
    rootGroup.add(defenseDome);

    // Orbital defense rings
    const ringShield1Geom = new THREE.TorusGeometry(18, 0.08, 16, 64);
    const ringShield1Mat = new THREE.MeshBasicMaterial({ color: 0xFAF6EE, transparent: true, opacity: 0 });
    const ringShield1 = new THREE.Mesh(ringShield1Geom, ringShield1Mat);
    ringShield1.position.set(0, 2, 0);
    rootGroup.add(ringShield1);

    const ringShield2Geom = new THREE.TorusGeometry(18.5, 0.08, 16, 64);
    const ringShield2Mat = new THREE.MeshBasicMaterial({ color: 0xD8CBB5, transparent: true, opacity: 0 });
    const ringShield2 = new THREE.Mesh(ringShield2Geom, ringShield2Mat);
    ringShield2.rotation.x = Math.PI / 3;
    ringShield2.position.set(0, 2, 0);
    rootGroup.add(ringShield2);

    // Cyber dust particles
    const dustCount = 80;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 46;
      dustPositions[i * 3 + 1] = Math.random() * 22 - 4;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 46;
    }
    const dustGeom = new THREE.BufferGeometry();
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xD8CBB5,
      size: 0.28,
      transparent: true,
      opacity: 0.45
    });
    const dustMesh = new THREE.Points(dustGeom, dustMat);
    rootGroup.add(dustMesh);

    // Pointer Interaction State (Drag vs Click to advance)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let isDragging = false;
    let mouseParallaxX = 0;
    let mouseParallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      isDragging = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetParallaxX = normX * 0.3;
      targetParallaxY = normY * 0.2;

      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      if (dist > 8) {
        isDragging = true;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      // If user performed a clean click on the 3D scene (not a drag), advance stage!
      if (dist < 6 && isZoomedInRef.current) {
        const target = e.target as HTMLElement;
        // Don't trigger if clicked on HUD button
        if (!target.closest('button') && !target.closest('.hud-panel')) {
          const next = (stageRef.current + 1) % INCIDENT_RESPONSE_STAGES.length;
          navigateToStage(next);
        }
      }
      isDragging = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with cinematic easing and stage synchronization
    let animationFrameId: number;
    const startTimeMs = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTimeMs) * 0.001;
      const currentStage = stageRef.current;
      const zoomedIn = isZoomedInRef.current;

      // Parallax smoothing
      mouseParallaxX += (targetParallaxX - mouseParallaxX) * 0.04;
      mouseParallaxY += (targetParallaxY - mouseParallaxY) * 0.04;

      // Camera Choreography
      if (zoomedIn) {
        const transition = cameraTransitionRef.current;
        if (transition.active) {
          const elapsedInTrans = elapsedTime - transition.startTime;
          const tClamped = Math.min(1, Math.max(0, elapsedInTrans / transition.duration));

          // Smooth cubic polynomial easing
          const ease = tClamped < 0.5
            ? 4 * tClamped * tClamped * tClamped
            : 1 - Math.pow(-2 * tClamped + 2, 3) / 2;

          // Parabolic arc for cinematic camera swoop
          const arc = Math.sin(tClamped * Math.PI);

          camera.position.x = transition.startPos.x + (transition.targetPos.x - transition.startPos.x) * ease + arc * transition.arcOffset.x + mouseParallaxX * 0.8;
          camera.position.y = transition.startPos.y + (transition.targetPos.y - transition.startPos.y) * ease + arc * transition.arcOffset.y + mouseParallaxY * 0.5;
          camera.position.z = transition.startPos.z + (transition.targetPos.z - transition.startPos.z) * ease + arc * transition.arcOffset.z;

          currentLookAtRef.current.lerpVectors(transition.startLookAt, transition.targetLookAt, ease);
          camera.lookAt(currentLookAtRef.current);

          if (tClamped >= 1) {
            transition.active = false;
          }
        } else {
          // Subtle breathing / floating motion when resting at target stage
          const targetStageObj = INCIDENT_RESPONSE_STAGES[currentStage];
          const [tx, ty, tz] = targetStageObj.camera.pos;
          const [lx, ly, lz] = targetStageObj.camera.lookAt;

          const floatX = Math.sin(elapsedTime * 0.7) * 0.12 + mouseParallaxX * 0.9;
          const floatY = Math.cos(elapsedTime * 0.5) * 0.10 + mouseParallaxY * 0.6;

          camera.position.set(tx + floatX, ty + floatY, tz);
          currentLookAtRef.current.set(lx, ly, lz);
          camera.lookAt(currentLookAtRef.current);
        }
      } else {
        // Standard view: Autonomous stately orbital drift behind the monumental hero text
        const autoAngle = elapsedTime * 0.032;
        const cameraDist = 32;
        camera.position.x = Math.sin(autoAngle) * cameraDist + mouseParallaxX * 2.8;
        camera.position.z = Math.cos(autoAngle) * cameraDist;
        camera.position.y = 13 + Math.sin(elapsedTime * 0.22) * 1.2 + mouseParallaxY * 1.5;
        camera.lookAt(0, 0.3, 0);
        cameraTransitionRef.current.startPos.copy(camera.position);
      }

      // Monolith gentle floating
      nodeMeshes.forEach((item, idx) => {
        const floatDelta = Math.sin(elapsedTime * 0.9 + idx * 0.7) * 0.06;
        item.mesh.position.y = THREE.MathUtils.lerp(
          item.mesh.position.y,
          item.config.y + floatDelta,
          0.06
        );

        const meshMat = item.mesh.material as THREE.MeshStandardMaterial;

        // Dynamic node materials across the 7 stages
        if (item.isTarget) {
          if (currentStage === 0) {
            // Stage 1: Corrupted alarm state with rapid pulse
            const pulse = (Math.sin(elapsedTime * 6.5) + 1) * 0.5;
            meshMat.emissive.setHex(0xE05A47);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.4 + pulse * 0.6, 0.08);
          } else if (currentStage === 1) {
            // Stage 2: Triage state with scanning pulse
            const pulse = (Math.sin(elapsedTime * 3.0) + 1) * 0.5;
            meshMat.emissive.setHex(0xD8CBB5);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.3 + pulse * 0.3, 0.06);
          } else if (currentStage === 2) {
            // Stage 3: Contained quarantine
            meshMat.emissive.setHex(0xF59E0B);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.25, 0.06);
          } else if (currentStage === 3) {
            // Stage 4: Eradication sweep
            const sweepGlow = (Math.sin(elapsedTime * 4.5) + 1) * 0.5;
            meshMat.emissive.setHex(0xD8CBB5);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.15 + sweepGlow * 0.4, 0.06);
          } else if (currentStage === 4) {
            // Stage 5: System Recovery (Clean Emerald)
            meshMat.emissive.setHex(0x52B788);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.45, 0.06);
          } else {
            // Stage 6 & 7: Hardened / Pristine steady state
            meshMat.emissive.setHex(0xD8CBB5);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.15, 0.05);
          }
        } else {
          // Non-target nodes
          if (currentStage === 4) {
            // All nodes glow green during recovery
            meshMat.emissive.setHex(0x52B788);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.35, 0.05);
          } else if (currentStage === 6) {
            // All nodes glow golden during fortification
            meshMat.emissive.setHex(0xFAF6EE);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.22, 0.05);
          } else {
            meshMat.emissive.setHex(0x2C0712);
            meshMat.emissiveIntensity = THREE.MathUtils.lerp(meshMat.emissiveIntensity, 0.1, 0.05);
          }
        }
      });

      // Data particles along conduits
      const pPositions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const conduitIdx = particleConduits[i];
        const conduit = conduits[conduitIdx];

        // In Stage 3 (Containment), halt traffic to quarantined gateway
        if (currentStage === 2 && conduit.touchesTarget) {
          particleProgress[i] = 0;
          pPositions[i * 3] = 999;
          pPositions[i * 3 + 1] = 999;
          pPositions[i * 3 + 2] = 999;
          continue;
        }

        particleProgress[i] += particleSpeeds[i];
        if (particleProgress[i] > 1) {
          particleProgress[i] = 0;
          particleConduits[i] = Math.floor(Math.random() * conduits.length);
        }

        const t = particleProgress[i];
        pPositions[i * 3] = conduit.start.x + (conduit.end.x - conduit.start.x) * t;
        pPositions[i * 3 + 1] = conduit.start.y + (conduit.end.y - conduit.start.y) * t;
        pPositions[i * 3 + 2] = conduit.start.z + (conduit.end.z - conduit.start.z) * t;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // ==========================================
      // ANIMATE 3D STAGE-SPECIFIC OBJECTS
      // ==========================================

      // STAGE 01: Threat Detected
      if (currentStage === 0) {
        alertLight.intensity = THREE.MathUtils.lerp(alertLight.intensity, 3.5 + Math.sin(elapsedTime * 6) * 1.5, 0.08);
        beaconMat.opacity = THREE.MathUtils.lerp(beaconMat.opacity, 0.95, 0.06);
        alertBeacon.rotation.y = elapsedTime * 2.5;

        threatRingMat.opacity = THREE.MathUtils.lerp(threatRingMat.opacity, 0.85, 0.06);
        const waveScale = 1.0 + ((elapsedTime * 1.8) % 1) * 2.2;
        threatRing.scale.set(waveScale, waveScale, waveScale);

        threatPMat.opacity = THREE.MathUtils.lerp(threatPMat.opacity, 0.95, 0.06);
        const tpArr = threatPGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < threatPCount; i++) {
          threatPAngles[i] += threatPSpeeds[i];
          const r = 2.0 + Math.sin(i * 1.2 + elapsedTime * 2.0) * 0.8;
          tpArr[i * 3] = Math.cos(threatPAngles[i]) * r;
          tpArr[i * 3 + 1] = Math.sin(elapsedTime * 2.5 + i) * 1.8 + 1.2;
          tpArr[i * 3 + 2] = Math.sin(threatPAngles[i]) * r;
        }
        threatPGeom.attributes.position.needsUpdate = true;
      } else {
        alertLight.intensity = THREE.MathUtils.lerp(alertLight.intensity, 0, 0.08);
        beaconMat.opacity = THREE.MathUtils.lerp(beaconMat.opacity, 0, 0.06);
        threatRingMat.opacity = THREE.MathUtils.lerp(threatRingMat.opacity, 0, 0.06);
        threatPMat.opacity = THREE.MathUtils.lerp(threatPMat.opacity, 0, 0.06);
      }

      // STAGE 02: Holographic Investigation Panels
      if (currentStage === 1) {
        holoMat1.opacity = THREE.MathUtils.lerp(holoMat1.opacity, 0.94, 0.06);
        holoMat2.opacity = THREE.MathUtils.lerp(holoMat2.opacity, 0.94, 0.06);
        holoMesh1.position.y = 3.8 + Math.sin(elapsedTime * 1.2) * 0.15;
        holoMesh2.position.y = 3.4 + Math.cos(elapsedTime * 1.2) * 0.15;

        diagReticleMat.opacity = THREE.MathUtils.lerp(diagReticleMat.opacity, 0.85, 0.06);
        diagReticle.rotation.z = elapsedTime * 0.4;
      } else {
        holoMat1.opacity = THREE.MathUtils.lerp(holoMat1.opacity, 0, 0.06);
        holoMat2.opacity = THREE.MathUtils.lerp(holoMat2.opacity, 0, 0.06);
        diagReticleMat.opacity = THREE.MathUtils.lerp(diagReticleMat.opacity, 0, 0.06);
      }

      // STAGE 03: Containment Barrier
      if (currentStage === 2) {
        barrierMat.opacity = THREE.MathUtils.lerp(barrierMat.opacity, 0.58, 0.06);
        barrierWireMat.opacity = THREE.MathUtils.lerp(barrierWireMat.opacity, 0.92, 0.06);
        barrierMesh.rotation.y = elapsedTime * 0.22;
        pylonMat.opacity = THREE.MathUtils.lerp(pylonMat.opacity, 0.88, 0.06);

        // Sever conduits connected to gateway
        conduits.forEach((c) => {
          if (c.touchesTarget) {
            c.material.opacity = THREE.MathUtils.lerp(c.material.opacity, 0.15, 0.06);
            c.material.color.setHex(0x5C1D2D);
          } else {
            c.material.opacity = THREE.MathUtils.lerp(c.material.opacity, 0.95, 0.06);
            c.material.color.setHex(0xFAF6EE);
          }
        });
      } else {
        barrierMat.opacity = THREE.MathUtils.lerp(barrierMat.opacity, 0, 0.06);
        barrierWireMat.opacity = THREE.MathUtils.lerp(barrierWireMat.opacity, 0, 0.06);
        pylonMat.opacity = THREE.MathUtils.lerp(pylonMat.opacity, 0, 0.06);

        if (currentStage !== 2) {
          conduits.forEach((c) => {
            c.material.opacity = THREE.MathUtils.lerp(c.material.opacity, 0.65, 0.06);
            c.material.color.setHex(0xD8CBB5);
          });
        }
      }

      // STAGE 04: Eradication Laser Sweep
      if (currentStage === 3) {
        sweepPlaneMat.opacity = THREE.MathUtils.lerp(sweepPlaneMat.opacity, 0.78, 0.06);
        sweepPlane.position.y = Math.sin(elapsedTime * 2.8) * 2.2 + 0.4;

        purgePMat.opacity = THREE.MathUtils.lerp(purgePMat.opacity, 0.92, 0.06);
        const purgeArr = purgePGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < purgePCount; i++) {
          purgeArr[i * 3] += purgePVelocities[i * 3];
          purgeArr[i * 3 + 1] += purgePVelocities[i * 3 + 1];
          purgeArr[i * 3 + 2] += purgePVelocities[i * 3 + 2];

          // Reset purge particles when dispersed
          if (Math.hypot(purgeArr[i * 3], purgeArr[i * 3 + 2]) > 4.5 || purgeArr[i * 3 + 1] > 4.5) {
            purgeArr[i * 3] = (Math.random() - 0.5) * 1.2;
            purgeArr[i * 3 + 1] = sweepPlane.position.y;
            purgeArr[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
          }
        }
        purgePGeom.attributes.position.needsUpdate = true;
      } else {
        sweepPlaneMat.opacity = THREE.MathUtils.lerp(sweepPlaneMat.opacity, 0, 0.06);
        purgePMat.opacity = THREE.MathUtils.lerp(purgePMat.opacity, 0, 0.06);
      }

      // STAGE 05: System Recovery Beams
      if (currentStage === 4) {
        recoveryLight.intensity = THREE.MathUtils.lerp(recoveryLight.intensity, 2.8, 0.06);
        restoreMat1.opacity = THREE.MathUtils.lerp(restoreMat1.opacity, 0.88, 0.06);
        restoreMat2.opacity = THREE.MathUtils.lerp(restoreMat2.opacity, 0.88, 0.06);
      } else {
        recoveryLight.intensity = THREE.MathUtils.lerp(recoveryLight.intensity, 0, 0.06);
        restoreMat1.opacity = THREE.MathUtils.lerp(restoreMat1.opacity, 0, 0.06);
        restoreMat2.opacity = THREE.MathUtils.lerp(restoreMat2.opacity, 0, 0.06);
      }

      // STAGE 06: Post-Incident Review Timeline Axis
      if (currentStage === 5) {
        timelineRailMat.opacity = THREE.MathUtils.lerp(timelineRailMat.opacity, 0.85, 0.06);
        milestoneBeacons.forEach((beacon, idx) => {
          const bMat = beacon.material as THREE.MeshBasicMaterial;
          bMat.opacity = THREE.MathUtils.lerp(bMat.opacity, 0.9, 0.06);
          const childCap = beacon.children[0] as THREE.Mesh;
          if (childCap) {
            const cMat = childCap.material as THREE.MeshBasicMaterial;
            const pulse = (Math.sin(elapsedTime * 3.5 + idx * 0.9) + 1) * 0.5;
            cMat.opacity = THREE.MathUtils.lerp(cMat.opacity, 0.4 + pulse * 0.6, 0.08);
          }
        });
      } else {
        timelineRailMat.opacity = THREE.MathUtils.lerp(timelineRailMat.opacity, 0, 0.06);
        milestoneBeacons.forEach((beacon) => {
          const bMat = beacon.material as THREE.MeshBasicMaterial;
          bMat.opacity = THREE.MathUtils.lerp(bMat.opacity, 0, 0.06);
          const childCap = beacon.children[0] as THREE.Mesh;
          if (childCap) {
            const cMat = childCap.material as THREE.MeshBasicMaterial;
            cMat.opacity = THREE.MathUtils.lerp(cMat.opacity, 0, 0.06);
          }
        });
      }

      // STAGE 07: Security Reinforcement Defense Dome
      if (currentStage === 6) {
        defenseDomeMat.opacity = THREE.MathUtils.lerp(defenseDomeMat.opacity, 0.52, 0.06);
        ringShield1Mat.opacity = THREE.MathUtils.lerp(ringShield1Mat.opacity, 0.85, 0.06);
        ringShield2Mat.opacity = THREE.MathUtils.lerp(ringShield2Mat.opacity, 0.75, 0.06);

        defenseDome.rotation.y = elapsedTime * 0.06;
        defenseDome.rotation.x = elapsedTime * 0.03;
        ringShield1.rotation.z = elapsedTime * 0.18;
        ringShield2.rotation.y = elapsedTime * 0.15;
      } else {
        defenseDomeMat.opacity = THREE.MathUtils.lerp(defenseDomeMat.opacity, 0, 0.06);
        ringShield1Mat.opacity = THREE.MathUtils.lerp(ringShield1Mat.opacity, 0, 0.06);
        ringShield2Mat.opacity = THREE.MathUtils.lerp(ringShield2Mat.opacity, 0, 0.06);
      }

      // Cyber dust drift
      dustMesh.rotation.y = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [navigateToStage]);

  const activeStage = INCIDENT_RESPONSE_STAGES[currentStageIndex];

  // Pick stage icon for badge
  const renderStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1:
        return <ShieldWarning size={16} weight="bold" className="text-[#E05A47]" />;
      case 2:
        return <MagnifyingGlass size={16} weight="bold" className="text-[#D8CBB5]" />;
      case 3:
        return <LockKey size={16} weight="bold" className="text-[#F59E0B]" />;
      case 4:
        return <Lightning size={16} weight="bold" className="text-[#D8CBB5]" />;
      case 5:
        return <Pulse size={16} weight="bold" className="text-[#52B788]" />;
      case 6:
        return <ClockCounterClockwise size={16} weight="bold" className="text-[#D8CBB5]" />;
      case 7:
        return <ShieldCheck size={16} weight="bold" className="text-[#FAF6EE]" />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  return (
    <div
      className={`relative w-full h-full select-none ${
        isZoomedIn ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
      title={isZoomedIn ? 'Click anywhere on the scene to travel to the next stage' : 'Double-click to enter 3D Command Center'}
    >
      {/* Three.js Canvas Container (Full Bleed Background) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* ========================================================================= */}
      {/* 3D COMMAND CENTER HUD (VISIBLE WHEN ZOOMED IN) */}
      {/* ========================================================================= */}
      {isZoomedIn && (
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
          {/* Top Bar: Command Center Header + Step Pipeline + Exit */}
          <div className="w-full flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left: Command Center Brand Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#2C0712]/92 backdrop-blur-xl border border-[#5C1D2D] shadow-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: activeStage.statusColor }} />
              <span className="font-bold text-[#FAF6EE] hidden sm:inline">CYBERCPR COMMAND CENTER</span>
              <span className="text-[#5C1D2D] hidden sm:inline">|</span>
              <span className="text-[#D8CBB5] font-semibold">{activeStage.badge}</span>
            </div>

            {/* Center: 7-Stage Interactive Pipeline (Hidden on small mobile) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C0712]/92 backdrop-blur-xl border border-[#5C1D2D] shadow-xl">
              {INCIDENT_RESPONSE_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToStage(idx);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentStageIndex === idx
                      ? 'bg-[#D8CBB5] text-[#3F0D1B] shadow-sm scale-105'
                      : 'text-[#D8CBB5]/70 hover:text-[#FAF6EE] hover:bg-[#3F0D1B]'
                  }`}
                  title={`${s.badge}: ${s.title}`}
                >
                  <span>{s.stageNumber}</span>
                  {currentStageIndex === idx && (
                    <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-tight">
                      {s.title}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right: Controls + Exit Button */}
            <div className="flex items-center gap-2">
              {onToggleZoom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleZoom();
                  }}
                  className="p-2 rounded-full bg-[#2C0712]/92 hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] hover:border-[#D8CBB5] transition-all cursor-pointer shadow-lg"
                  title="Return to standard view"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Middle Left: Floating Holographic Stage Dossier Card */}
          <div className="w-full max-w-lg my-auto pointer-events-auto">
            <div
              key={cardKey}
              className="hud-panel animate-fadeIn rounded-2xl bg-[#2C0712]/92 backdrop-blur-xl border border-[#5C1D2D] p-5 sm:p-6 shadow-2xl space-y-4 text-left transition-all max-h-[62vh] sm:max-h-none overflow-y-auto"
            >
              {/* Category Pill + Status Tag */}
              <div className="flex items-center justify-between gap-2 border-b border-[#5C1D2D]/70 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#3F0D1B] border border-[#5C1D2D]">
                    {renderStageIcon(activeStage.id)}
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#D8CBB5]">
                    {activeStage.category}
                  </span>
                </div>

                <div
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${activeStage.statusColor}18`,
                    color: activeStage.statusColor,
                    borderColor: `${activeStage.statusColor}60`
                  }}
                >
                  {activeStage.statusTag}
                </div>
              </div>

              {/* Stage Title */}
              <div>
                <span className="font-mono text-xs text-[#D8CBB5]/70 block mb-1">
                  STAGE {activeStage.stageNumber} OF 07
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF6EE] leading-tight">
                  {activeStage.title}
                </h3>
              </div>

              {/* Meaningful Stage Explanation */}
              <p className="text-sm sm:text-base text-[#D8CBB5]/90 font-light leading-relaxed">
                {activeStage.explanation}
              </p>

              {/* 4 Structured Information Display Points */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#D8CBB5]/70 font-semibold block">
                  Action Telemetry & Protocols
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeStage.displayPoints.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#3F0D1B]/70 border border-[#5C1D2D]/60 text-xs text-[#FAF6EE]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: activeStage.statusColor }}
                      />
                      <span className="font-medium truncate">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Metrics Bar */}
              <div className="pt-2 border-t border-[#5C1D2D]/70 grid grid-cols-3 gap-2 text-center">
                {activeStage.telemetryMetrics.map((met, mIdx) => (
                  <div key={mIdx} className="bg-[#20050D]/60 p-1.5 rounded-lg border border-[#5C1D2D]/40">
                    <div className="text-[10px] text-[#D8CBB5]/70 font-mono truncate">{met.label}</div>
                    <div className="font-mono text-xs font-bold text-[#FAF6EE] truncate mt-0.5">{met.value}</div>
                  </div>
                ))}
              </div>

              {/* Highlighted Click-to-advance interactive prompt */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#5C1D2D]/60">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3F0D1B] hover:bg-[#5C1D2D] border-2 border-[#D8CBB5] hover:border-[#FAF6EE] text-[#FAF6EE] font-mono font-bold text-xs shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:scale-102"
                >
                  <span className="px-1.5 py-0.2 rounded bg-[#E05A47] text-[#FAF6EE] font-mono text-[9px] uppercase font-black animate-pulse">
                    CLICK ME
                  </span>
                  <span>Advance to Next 3D Stage</span>
                  <CaretRight size={13} weight="bold" />
                </button>
                <span className="text-[#D8CBB5] font-mono text-xs font-semibold">
                  {Math.round((activeStage.id / 7) * 100)}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Bar: Previous, Step Pills, Next / Restart */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
            {/* Playback Controls & Progress Bar */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-md ${
                  isPlaying
                    ? 'bg-[#D8CBB5] text-[#3F0D1B]'
                    : 'bg-[#2C0712]/92 hover:bg-[#3F0D1B] text-[#D8CBB5] border border-[#5C1D2D]'
                }`}
                title={isPlaying ? 'Pause sequence' : 'Play autonomous cinematic tour'}
              >
                {isPlaying ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                }}
                className="p-2.5 rounded-xl bg-[#2C0712]/92 hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] transition-all cursor-pointer shadow-md"
                title="Restart from Stage 01"
              >
                <ArrowClockwise size={15} />
              </button>

              <div className="flex flex-col gap-1 w-full sm:w-44">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#D8CBB5]/80">
                  <span>STAGE {activeStage.stageNumber} / 07</span>
                  <span>{Math.round((activeStage.id / 7) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#3F0D1B] overflow-hidden border border-[#5C1D2D]/60">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${(activeStage.id / 7) * 100}%`,
                      backgroundColor: activeStage.statusColor
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Buttons: Previous & Next / Restart */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                disabled={currentStageIndex === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  currentStageIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-[#2C0712]/60 text-[#D8CBB5]/50 border border-[#5C1D2D]/40'
                    : 'bg-[#2C0712]/92 hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D]'
                }`}
              >
                <CaretLeft size={14} weight="bold" />
                <span>PREVIOUS STEP</span>
              </button>

              {currentStageIndex < INCIDENT_RESPONSE_STAGES.length - 1 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="relative group px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D8CBB5] via-[#FAF6EE] to-[#D8CBB5] hover:from-[#FAF6EE] hover:to-[#FFFFFF] text-[#3F0D1B] font-mono font-black text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(216,203,181,0.5)] hover:shadow-[0_0_30px_rgba(250,246,238,0.8)] hover:scale-105 active:scale-95 border-2 border-[#FAF6EE]"
                >
                  <span className="absolute -top-3 -right-1 px-2 py-0.5 rounded-full bg-[#E05A47] text-[#FAF6EE] text-[9px] font-black tracking-wider uppercase shadow-md animate-bounce border border-[#FAF6EE]">
                    CLICK ME
                  </span>
                  <span>NEXT STEP</span>
                  <CaretRight size={14} weight="bold" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestart();
                  }}
                  className="relative group px-6 py-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white text-[#3F0D1B] font-mono font-black text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(250,246,238,0.7)] hover:scale-105 active:scale-95 border-2 border-[#FAF6EE]"
                >
                  <span className="absolute -top-3 -right-1 px-2 py-0.5 rounded-full bg-[#E05A47] text-[#FAF6EE] text-[9px] font-black tracking-wider uppercase shadow-md animate-bounce border border-[#FAF6EE]">
                    CLICK ME
                  </span>
                  <ArrowClockwise size={15} weight="bold" />
                  <span>RESTART EXPERIENCE</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD HERO VIEW HUD (VISIBLE WHEN NOT ZOOMED IN) */}
      {/* ========================================================================= */}
      {!isZoomedIn && (
        <button
          onClick={onToggleZoom}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#2C0712]/95 hover:bg-[#3F0D1B] backdrop-blur-md border-2 border-[#D8CBB5] hover:border-[#FAF6EE] text-[#FAF6EE] shadow-[0_0_20px_rgba(216,203,181,0.35)] hover:shadow-[0_0_30px_rgba(216,203,181,0.55)] cursor-pointer transition-all transform hover:scale-105 active:scale-95"
          title="Click to launch interactive 3D Cyber Incident Response Command Center"
        >
          <span className="px-2 py-0.5 rounded-md bg-[#E05A47] text-[#FAF6EE] font-mono text-[9px] font-bold uppercase animate-pulse">
            CLICK ME
          </span>
          <span className="font-mono text-xs font-bold text-[#FAF6EE]">Launch 3D Command Center</span>
          <span className="text-[#5C1D2D]">|</span>
          <span className="font-mono text-xs text-[#D8CBB5]">7 Stages</span>
        </button>
      )}
    </div>
  );
};
