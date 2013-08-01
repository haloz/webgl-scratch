var gDebug = 1;

requirejs.config({
  paths: {
  'jquery'     : gDebug ? 'jquery-1.8.3' : 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
  'glmatrix'   : gDebug ? 'gl-matrix' : 'gl-matrix-min',
  'webgl-debug' : 'webgl-debug',
  'webgl-utils' : 'webgl-utils'
  }
});

require(['jquery', 'glmatrix', 'webgl-utils', (gDebug ? 'webgl-debug' : '')], function($){
  "use strict";
  var createGLContext = function(canvas) {
    var context = null;
    if(!window.WebGLRenderingContext) {
      alert("Get a WebGL browser at http://get.webgl.org");
      return null;
    }
    $.each(["webgl", "experimental-webgl"], function(index, element) {
      try {
        context = canvas.getContext(element);
      } catch(e) {
        if(context) {              
          return; // breaks from each
        } 
      }
    });
    if(context) {
      // full canvas area
      context.viewportWidth = canvas.width;
      context.viewportHeight = canvas.height; 
    } else {
      alert("Failed to create WebGL context. You browser basically supports WebGL but it appears to be deactivated.");
    }
    return context;
  };
  
  var setupBuffers = function(env) {
    env.vertexBuffer = env.gl.createBuffer();
    env.gl.bindBuffer(env.gl.ARRAY_BUFFER, env.vertexBuffer);
    var 
      triangleVertices = [
         0.0,  0.0,  0.0, 255,   0,   0, 255, // xyz,rgba
         1.0,  0.0,  0.0,   0, 250,  10, 255,
         0.0,  1.0,  0.0,   0,   0, 240, 255
      ],
      itemCount = 3;
      
    // 3x4byte for xyz + 4x1byte for rgba 
    var vertexSizeInBytes = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;
    var vertexSizeInFloats = vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;
    // create a buffer of that total size
    var buffer = new ArrayBuffer(itemCount * vertexSizeInBytes);
    // view pointer to the position entries of the buffer
    var positionView = new Float32Array(buffer);
    // view pointer to the color entries of the buffer
    var colorView = new Uint8Array(buffer);
    
    // now map all the values from triangleVertices (js array) to the typed buffer views
    for(var i = 0, k = 0, positionOffsetInFloats = 0, colorOffsetsInBytes = 12; i < itemCount; i++, k+=7) {
      positionView[positionOffsetInFloats]     = triangleVertices[k];
      positionView[positionOffsetInFloats + 1] = triangleVertices[k+1];
      positionView[positionOffsetInFloats + 2] = triangleVertices[k+2];
      colorView[colorOffsetsInBytes]     = triangleVertices[k+3];
      colorView[colorOffsetsInBytes + 1] = triangleVertices[k+4];
      colorView[colorOffsetsInBytes + 2] = triangleVertices[k+5];
      colorView[colorOffsetsInBytes + 3] = triangleVertices[k+6];
      
      positionOffsetInFloats += vertexSizeInFloats;
      colorOffsetsInBytes += vertexSizeInBytes;
    }
       
    env.gl.bufferData(env.gl.ARRAY_BUFFER, buffer, env.gl.STATIC_DRAW);
    env.vertexBuffer.positionSize = 3;
    env.vertexBuffer.colorSize = 4;
    env.vertexBuffer.itemSize = 3;      // size of an item, always 3 verts per triangle with buffered strip
    env.vertexBuffer.numberOfItems = itemCount;                        
  };
  
  var setupMatrices = function(env) {
    env.modelViewMatrix = mat4.create();
    mat4.identity(env.modelViewMatrix);
    mat4.lookAt([1.0, 2.0, -5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], env.modelViewMatrix);
    
    env.projectionMatrix = mat4.create();        
    mat4.perspective(
      45, 
      env.gl.viewportWidth / env.gl.viewportHeight,
      1.0,
      10000.0,
      env.projectionMatrix
    );    
  };
  
  var loadShaderViaAjax = function(env, filename) {  
    var shader;                      
    $.ajax({
      async: false,
      url: filename,
      success: function (data) {
        var jqdata = $(data),      
            shaderType = jqdata.attr("type") === "x-shader/x-vertex" ? env.gl.VERTEX_SHADER : env.gl.FRAGMENT_SHADER,
            shaderSource = jqdata.html();
              
        shader = env.gl.createShader(shaderType);
        env.gl.shaderSource(shader, shaderSource);
        env.gl.compileShader(shader);
        
        if(!env.gl.getShaderParameter(shader, env.gl.COMPILE_STATUS)) {
          alert(env.gl.getShaderInfoLog(shader));
        }      
      },
      dataType: 'html'
    });
    return shader;
  };
  
  var setupShaders = function(env) {
    // load shader code
    var vertexShader = loadShaderViaAjax(env, 'shader/mycube.vs'),
        fragmentShader = loadShaderViaAjax(env, 'shader/mycube.fs');

    // compile shaders
    env.shaderProgram = env.gl.createProgram();
    env.gl.attachShader(env.shaderProgram, vertexShader);
    env.gl.attachShader(env.shaderProgram, fragmentShader);
    env.gl.linkProgram(env.shaderProgram);
    if(!env.gl.getProgramParameter(env.shaderProgram, env.gl.LINK_STATUS)) {
      alert("Failed to setup shaders");
    }
    env.gl.useProgram(env.shaderProgram);
            
    // assign variables to shaders
    env.shaderProgram.vertexPositionAttribute = env.gl.getAttribLocation(env.shaderProgram, "aVertexPosition");
    env.shaderProgram.vertexColorAttribute = env.gl.getAttribLocation(env.shaderProgram, "aVertexColor");
    env.gl.uniformMatrix4fv(          
      env.gl.getUniformLocation(env.shaderProgram, "uMVMatrix"),
      false,
      env.modelViewMatrix
    );
    env.gl.uniformMatrix4fv(
      env.gl.getUniformLocation(env.shaderProgram, "uPMatrix"), 
      false, 
      env.projectionMatrix
    );
    
    // activate arrays
    env.gl.enableVertexAttribArray(env.shaderProgram.vertexPositionAttribute);
    env.gl.enableVertexAttribArray(env.shaderProgram.vertexColorAttribute);
  };

  var startup = function(env) {
    env.canvas = $("#simplecanvas")[0];  
    env.gl = gDebug ? WebGLDebugUtils.makeDebugContext(createGLContext(env.canvas)) : createGLContext(env.canvas);
  
    setupMatrices(env);
    setupShaders(env);
    setupBuffers(env);    
    env.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  };  
  
  var draw = function(env) {
    env.gl.clear(env.gl.COLOR_BUFFER_BIT);
    
    // http://www.khronos.org/opengles/sdk/docs/man/xhtml/glVertexAttribPointer.xml
    env.gl.vertexAttribPointer(
      env.shaderProgram.vertexPositionAttribute, 
      env.vertexBuffer.positionSize, 
      env.gl.FLOAT,
      false, // no need to normaliz the values, they're already floats
      16, // stride => 12byte xzy + 4byte rgba, in bytes
      0 // no offset as xyz values are first, in bytes
    );
    env.gl.vertexAttribPointer(
      env.shaderProgram.vertexColorAttribute, 
      env.vertexBuffer.colorSize, 
      env.gl.UNSIGNED_BYTE,
      true, // normalized => means that 0-255 rgba values are converted into unsigned floats from 0.0 to 1.0 
      16, // stride => 12byte xzy + 4byte rgba, in bytes
      12 // offset, rgba values come after the 12byte xyz, in bytes
    );
        
    env.gl.drawArrays(env.gl.TRIANGLES, 0, env.vertexBuffer.numberOfItems);
  };  

  // ---------------------------

  $(document).ready(function() {     
    // main routine  
    var environment = { 
      gl : undefined,
      canvas : undefined,
      shaderProgram : undefined,
      vertexBuffer : undefined
    };        
    startup(environment);
    draw(environment);
  });
});
