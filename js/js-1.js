<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smooth Scroll & Sticky Header</title>
  <style>
    /* ========================================== */
    /* 1. GLOBAL BASE STYLES                      */
    /* ========================================== */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0d0d0d;
      color: #ffffff;
      overflow-x: hidden;
    }

    /* ========================================== */
    /* 2. SMOOTH SCROLL VIEWPORT TRACK            */
    /* ========================================== */
    #scroll-viewport {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #scroll-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      will-change: transform;
    }

    /* ========================================== */
    /* 3. STICKY HEADER ASSEMBLY                  */
    /* ========================================== */
    .site-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(13, 13, 13, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding: 24px 0;
      
      /* Initial hidden position baseline right above view limit */
      transform: translateY(-100%);
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    /* Header Revealed Modifier State */
    .site-header.is-revealed {
      transform: translateY(0);
    }

    .header-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .site-logo {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.5px;
    }

    .site-nav .nav-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      margin-left: 32px;
      font-size: 14px;
      transition: color 0.3s ease;
    }

    .site-nav .nav-link:hover {
      color: #ffffff;
    }

    /* ========================================== */
    /* 4. DEMO SPACER CONTENT                     */
    /* ========================================== */
    .hero-section {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 10%;
      box-sizing: border-box;
    }
    .hero-section h1 { 
      font-size: clamp(40px, 8vw, 90px); 
      margin: 0 0 20px 0; 
      letter-spacing: -2px; 
    }
    .hero-section p { 
      font-size: 18px; 
      color: rgba(255,255,255,0.5); 
    }
    .spacer-section { 
      height: 200vh; 
      background: linear-gradient(#0d0d0d, #1a1a1a); 
    }
  </style>
</head>
<body>

  <!-- Viewport wrapper that intercepts native scroll behavior -->
  <div id="scroll-viewport">
    <div id="scroll-content">
      
      <!-- Sticky Header Component -->
      <header class="site-header">
        <div class="header-container">
          <div class="site-logo">Brand</div>
          <nav class="site-nav">
            <a href="#" class="nav-link">Work</a>
            <a href="#" class="nav-link">About</a>
            <a href="#" class="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      <!-- Main Page Content Content -->
      <main class="page-content">
        <section class="hero-section">
          <h1>Smooth Scrolling Page</h1>
          <p>Scroll down to reveal the custom premium sticky header bar layout.</p>
        </section>
        <section class="spacer-section"></section>
      </main>

    </div>
  </div>

  <!-- ========================================== -->
  <!-- 5. SMOOTH INTERTIA ENGINE & HEADER LOGIC   -->
  <!-- ========================================== -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const content = document.getElementById("scroll-content");
      const header = document.querySelector(".site-header");

      // Physics Core Metrics
      let currentScroll = 0;
      let targetScroll = 0;
      const easeFactor = 0.075; // Friction value (lower is slicker/smoother)

      // Tracking and Trigger Logic Vectors
      let lastScrollY = 0;
      const activationThreshold = 200; // Exact distance pixel limit before reveal allows

      // Propagates layout calculations dynamically to the window frame layer
      function updateDocumentHeight() {
        document.body.style.height = `${content.getBoundingClientRect().height}px`;
      }
      
      window.addEventListener("resize", updateDocumentHeight);
      
      // Intercept system scroll updates
      window.addEventListener("scroll", () => {
        targetScroll = window.scrollY;
      }, { passive: true });

      // Main animation framework loop
      function engineFrameLoop() {
        // Linear interpolation loop calculates smooth trailing steps
        currentScroll += (targetScroll - currentScroll) * easeFactor;
        
        // Update container element placement matrix
        content.style.transform = `translate3d(0, ${-currentScroll}px, 0)`;

        // Process positional metrics against state triggers
        if (currentScroll > activationThreshold && currentScroll > lastScrollY) {
          // Direct descending scroll track past minimum trigger height
          header.classList.add("is-revealed");
        } else if (currentScroll <= activationThreshold) {
          // Document frame returns safely above boundary limit lines
          header.classList.remove("is-revealed");
        }

        lastScrollY = currentScroll;
        requestAnimationFrame(engineFrameLoop);
      }

      // Engage render pipeline initialization routines
      updateDocumentHeight();
      requestAnimationFrame(engineFrameLoop);
    });
  </script>
</body>
</html>
