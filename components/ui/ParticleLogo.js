'use client';

import { useEffect, useRef } from 'react';

export default function ParticleLogo() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let particlesArray = [];
        let animationId;
        let logoImageLoaded = false;

        // Configuration
        const CONFIG = {
            imageSource: '/logo.png',
            particleGap: 2,
            particleSize: 2,
            friction: 0.985,
            ease: 0.02,
            mouseRadius: 100,
            cursorSize: 6,
            repulsionStrength: 50,
            maxVelocity: 50,
            entryDuration: 90,
            entrySpread: 400, // Reduced spread for contained area
            cropRadiusPercentage: 0.88,
        };

        const mouse = {
            x: undefined,
            y: undefined,
            radius: CONFIG.mouseRadius,
            isActive: false
        };

        // Event Listeners for Mouse - Adjusted for absolute positioning
        const handleMouseMove = (e) => {
            // e.x is screen coordinate. This is fine for window listeners.
            // But for interaction, we need coordinates relative to canvas if we want precision, 
            // OR we just use screen coordinates if the canvas has offsets.
            // Since we are using global window listeners, let's store global coordinates
            // and handle the offset in the update/draw logic or assume canvas is full screen relative to mouse.
            // Wait, if canvas is only on the right side, mouse.x (0 to 1920) will match canvas if mapped?
            // No. If canvas is at left: 960, top: 0, width: 960.
            // A mouse at x: 100 is NOT on the canvas.
            // A mouse at x: 1000 IS on the canvas (local x: 40).
            // The previous logic used specific mouse coordinates.

            mouse.x = e.clientX; // Use clientX standard
            mouse.y = e.clientY;
            mouse.isActive = true;
        };

        // ... typical listeners ...
        const handleMouseLeave = () => { mouse.isActive = false; };
        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
            mouse.isActive = true;
        };
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
            mouse.isActive = true;
        };
        const handleTouchEnd = () => { mouse.isActive = false; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        const logoImage = new Image();
        logoImage.src = CONFIG.imageSource;
        logoImage.crossOrigin = "Anonymous";

        let animationFrame = 0;

        function isInsidePentagon(x, y, cx, cy, radius) {
            const sides = 5;
            const vertices = [];
            const angleOffset = -Math.PI / 2;

            for (let i = 0; i < sides; i++) {
                const angle = angleOffset + (i * 2 * Math.PI / sides);
                vertices.push({
                    x: cx + Math.cos(angle) * radius,
                    y: cy + Math.sin(angle) * radius
                });
            }

            let inside = false;
            for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
                const xi = vertices[i].x, yi = vertices[i].y;
                const xj = vertices[j].x, yj = vertices[j].y;
                const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        class Particle {
            constructor(x, y, color, index) {
                this.originX = x;
                this.originY = y;
                const angle = Math.random() * Math.PI * 2;
                const distance = CONFIG.entrySpread * (0.3 + Math.random() * 0.7);
                this.x = x + Math.cos(angle) * distance;
                this.y = y + Math.sin(angle) * distance;
                this.color = color;
                this.vx = 0;
                this.vy = 0;
                this.size = CONFIG.particleSize;
                this.index = index;
                this.entryDelay = Math.random() * 20;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                const effectiveFrame = Math.max(0, animationFrame - this.entryDelay);
                const entryProgress = Math.min(1, effectiveFrame / CONFIG.entryDuration);
                const easing = 1 - Math.pow(1 - entryProgress, 3);

                // Mouse Interaction Logic adjusted for Canvas Position
                const rect = canvas.getBoundingClientRect();
                // Mouse coordinates are global (window).
                // Particle coordinates are local (canvas).
                // We must convert mouse global to local.
                const localMouseX = mouse.x - rect.left;
                const localMouseY = mouse.y - rect.top;

                if (mouse.isActive) {
                    const dx = localMouseX - this.x;
                    const dy = localMouseY - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius && distance > 0) {
                        const force = Math.pow((mouse.radius - distance) / mouse.radius, 1.5);
                        const angle = Math.atan2(dy, dx);
                        const impulse = force * CONFIG.repulsionStrength;

                        this.vx -= Math.cos(angle) * impulse;
                        this.vy -= Math.sin(angle) * impulse;
                    }
                }

                const distHomeX = this.originX - this.x;
                const distHomeY = this.originY - this.y;
                const distanceFromHome = Math.sqrt(distHomeX * distHomeX + distHomeY * distHomeY);

                if (distanceFromHome > 1) {
                    const easeFactor = CONFIG.ease * (0.3 + easing * 0.7);
                    this.vx += distHomeX * easeFactor;
                    this.vy += distHomeY * easeFactor;
                } else {
                    this.vx *= 0.8;
                    this.vy *= 0.8;
                }

                this.vx *= CONFIG.friction;
                this.vy *= CONFIG.friction;

                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > CONFIG.maxVelocity) {
                    this.vx = (this.vx / speed) * CONFIG.maxVelocity;
                    this.vy = (this.vy / speed) * CONFIG.maxVelocity;
                }

                if (speed < 0.05 && distanceFromHome < 2) {
                    this.vx = 0;
                    this.vy = 0;
                    this.x = this.originX;
                    this.y = this.originY;
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                }
            }
        }

        function init() {
            if (!logoImageLoaded) return;

            particlesArray = [];
            animationFrame = 0;

            // Use container dimensions, NOT window dimensions
            const rect = canvas.parentNode.getBoundingClientRect();
            // Or essentially, since it's absolute 100%, use offsetWidth/Height
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Ensure reasonable size
            if (canvas.width === 0 || canvas.height === 0) return;

            const maxLogoSize = Math.min(canvas.width, canvas.height) * 0.6; // Slightly larger for container
            const scale = maxLogoSize / Math.max(logoImage.width, logoImage.height);

            const w = logoImage.width * scale;
            const h = logoImage.height * scale;
            const startX = (canvas.width - w) / 2;
            const startY = (canvas.height - h) / 2;

            // Draw image to extract data
            ctx.drawImage(logoImage, startX, startY, w, h);
            const data = ctx.getImageData(startX, startY, w, h);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the static image

            const centerX = w / 2;
            const centerY = h / 2;
            const cropRadius = (Math.min(w, h) / 2) * CONFIG.cropRadiusPercentage;

            let particleIndex = 0;

            for (let y = 0; y < h; y += CONFIG.particleGap) {
                for (let x = 0; x < w; x += CONFIG.particleGap) {
                    if (!isInsidePentagon(x, y, centerX, centerY, cropRadius)) continue;

                    const index = (Math.floor(y) * data.width + Math.floor(x)) * 4;
                    const alpha = data.data[index + 3];

                    if (alpha > 128) {
                        const r = data.data[index];
                        const g = data.data[index + 1];
                        const b = data.data[index + 2];
                        const color = `rgb(${r},${g},${b})`;

                        particlesArray.push(
                            new Particle(startX + x, startY + y, color, particleIndex++)
                        );
                    }
                }
            }
        }

        function drawCursor() {
            if (mouse.isActive && mouse.x !== undefined) {
                const rect = canvas.getBoundingClientRect();
                const localX = mouse.x - rect.left;
                const localY = mouse.y - rect.top;

                // Only draw cursor if inside or near canvas? No, user wants effect everywhere?
                // Actually cursor effect usually only makes sense if "on" the canvas.
                // Mouse events are global, so we check if localX/Y are within bounds?
                // Or just draw it anyway (it might look weird if outside).
                // Let's draw it anyway for the cool "trail" effect entering the zone.

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(localX, localY, mouse.radius, 0, Math.PI * 2);
                ctx.stroke();

                const gradient = ctx.createRadialGradient(
                    localX, localY, 0,
                    localX, localY, CONFIG.cursorSize
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(localX, localY, CONFIG.cursorSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                ctx.beginPath();
                ctx.arc(localX, localY, CONFIG.cursorSize * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }

            drawCursor();

            animationFrame++;
            animationId = requestAnimationFrame(animate);
        }

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);

        logoImage.onload = () => {
            logoImageLoaded = true;
            init();
        };

        // Start animation loop immediately (checks empty array until init)
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // Use absolute positioning to fill container
    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
            }}
        />
    );
}
