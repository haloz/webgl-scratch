var gDebug = 1;

requirejs.config({
  paths: {
    'jquery'     : gDebug ? 'jquery-1.8.3' : 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    'glmatrix'   : gDebug ? 'gl-matrix' : 'gl-matrix-min',
    'webgl-debug'  : 'webgl-debug',
    'webgl-utils'  : 'webgl-utils',
    'base-renderer' : 'base-renderer'
  }
});

require(['jquery', 'glmatrix', (gDebug ? 'webgl-debug' : ''), 'webgl-utils', 'base-renderer'], function($){
  "use strict";

  // ---------------------------

  $(document).ready(function() {     
    // main routine  
    var environment = { 
      gl : undefined,
      canvas : $("#simplecanvas")[0],
      shaderProgram : undefined,
      vertexBuffer : undefined,
      animationStartTime : undefined,
      currentTime : undefined,
      fpsCounter : undefined,
      cubeRotationDegree : 0,
      previousFrameTimeStamp : Date.now(),
      nbrOfFramesForFPS : 0,
      ongoingImageLoads : []
    };

    console.debug("jq", jQuery);
    var baseRenderer = new BaseRenderer(gDebug, jQuery);
        
    baseRenderer.startup(environment);
                
    baseRenderer.draw(environment);

    //console.debug("tex units", environment.gl.getParameter(environment.gl.MAX_TEXTURE_IMAGE_UNITS));              
  });
});
