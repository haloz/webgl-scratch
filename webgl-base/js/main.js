var gDebug = 0;
var gDebugContextLost = 0;

requirejs.config({
  paths: {
    'jquery'     : gDebug ? 'jquery-2.0.3' : 'http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min',
    'glmatrix'   : gDebug ? 'gl-matrix' : 'gl-matrix-min',
    'webgl-debug'  : 'webgl-debug',
    'webgl-utils'  : 'webgl-utils'
  }
});

require(['jquery', 'glmatrix', (gDebug ? 'webgl-debug' : ''), 'webgl-utils'], function($){
  "use strict";
  var createGLContext = function(canvas) {
    var context = WebGLUtils.setupWebGL(canvas);
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;     
    return context;
  };
  
  var onContextLost = function(event) {       
    // event.data.env
    event.preventDefault();
    cancelAnimFrame(event.data.env.requestID);
    
    // Ignore all ongoing image loads by removing their onload handler
    for(var i = 0; i < event.data.env.ongoingImageLoads.length; i++) {
     event.data.env.ongoingImageLoads[i].onload = undefined;
    }
    event.data.env.ongoingImageLoads = [];    
  };
  
  var onContextRestored = function(event) {
    startup(event.data.env);    
    draw(event.data.env);   
  };
  
  var setupBuffers = function(env) {
    var 
      cubeVertices = [
        // front face
         1.0,  1.0,  1.0, //v0
        -1.0,  1.0,  1.0, //v1
        -1.0, -1.0,  1.0, //v2
         1.0, -1.0,  1.0, //v3
        // back face
         1.0,  1.0, -1.0, //v4
        -1.0,  1.0, -1.0, //v5
        -1.0, -1.0, -1.0, //v6
         1.0, -1.0, -1.0, //v7
        // left face
        -1.0,  1.0,  1.0, //v8
        -1.0,  1.0, -1.0, //v9
        -1.0, -1.0, -1.0, //v10
        -1.0, -1.0,  1.0, //v11
        // right face
         1.0,  1.0,  1.0, //v12
         1.0, -1.0,  1.0, //v13
         1.0, -1.0, -1.0, //v14
         1.0,  1.0, -1.0, //v15
        // top face
         1.0,  1.0,  1.0, //v16
         1.0,  1.0, -1.0, //v17
        -1.0,  1.0, -1.0, //v18
        -1.0,  1.0,  1.0, //v19
        // bottom face
         1.0, -1.0,  1.0, //v20
         1.0, -1.0, -1.0, //v21
        -1.0, -1.0, -1.0, //v22
        -1.0, -1.0,  1.0  //v23
      ],
      cubeVertexIndices = [
         0,  1,  2,   0,  2,  3, // front face
         4,  6,  5,   4,  7,  6, // back face
         8,  9, 10,   8, 10, 11, // left face
        12, 13, 14,  12, 14, 15, // right face
        16, 17, 18,  16, 18, 19, // top face
        20, 22, 21,  20, 23, 22  // bottom face
      ],
      cubeTextureCoordinates = [
        //Front face
        0.0, 0.0, //v0
        1.0, 0.0, //v1
        1.0, 1.0, //v2
        0.0, 1.0, //v3
        
        // Back face
        0.0, 1.0, //v4
        1.0, 1.0, //v5
        1.0, 0.0, //v6
        0.0, 0.0, //v7
        
        // Left face
        0.0, 1.0, //v8
        1.0, 1.0, //v9
        1.0, 0.0, //v10
        0.0, 0.0, //v11
        
        // Right face
        0.0, 1.0, //v12
        1.0, 1.0, //v13
        1.0, 0.0, //v14
        0.0, 0.0, //v15
        
        // Top face
        0.0, 1.0, //v16
        1.0, 1.0, //v17
        1.0, 0.0, //v18
        0.0, 0.0, //v19
        
        // Bottom face
        0.0, 1.0, //v20
        1.0, 1.0, //v21
        1.0, 0.0, //v22
        0.0, 0.0, //v23        
      ];
    
    // map vertices into buffer
    env.cubeVertexPositionBuffer = env.gl.createBuffer();
    env.gl.bindBuffer(env.gl.ARRAY_BUFFER, env.cubeVertexPositionBuffer);
    env.gl.bufferData(env.gl.ARRAY_BUFFER, new Float32Array(cubeVertices), env.gl.STATIC_DRAW);
    env.cubeVertexPositionBuffer.itemSize = 3;
    env.cubeVertexPositionBuffer.numberOfItems = 24;
    
    // fill index buffer for element based draw
    env.cubeVertexIndexBuffer = env.gl.createBuffer();
    env.gl.bindBuffer(env.gl.ELEMENT_ARRAY_BUFFER, env.cubeVertexIndexBuffer);
    env.gl.bufferData(env.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), env.gl.STATIC_DRAW);
    env.cubeVertexIndexBuffer.itemSize = 1;
    env.cubeVertexIndexBuffer.numberOfItems = 36;
    
    // fill texture coords buffer
    // todo: interleave this data into the vertex buffer for better performance!      
    env.cubeVertexTextureCoordinateBuffer = env.gl.createBuffer();
    env.gl.bindBuffer(env.gl.ARRAY_BUFFER, env.cubeVertexTextureCoordinateBuffer);
    env.gl.bufferData(env.gl.ARRAY_BUFFER, new Float32Array(cubeTextureCoordinates), env.gl.STATIC_DRAW);
    env.cubeVertexTextureCoordinateBuffer.itemSize = 2;
    env.cubeVertexTextureCoordinateBuffer.numberOfItems = 24;
  };
  
  var loadImageForTexture = function(env, url, texture) {
    var img = $("<img/>").attr("src", url);
    env.ongoingImageLoads.push(img);
    $(img).on("load", { "env" : env, "texture" : texture }, function(event){
      env.ongoingImageLoads.splice(env.ongoingImageLoads.indexOf(this), 1);
      onTextureFinishLoading(event.data.env, this, event.data.texture);
    });    
  };
  
  var onTextureFinishLoading = function(env, image, texture) {
    env.gl.bindTexture(env.gl.TEXTURE_2D, texture);
    env.gl.pixelStorei(env.gl.UNPACK_FLIP_Y_WEBGL, true);
    env.gl.texImage2D(env.gl.TEXTURE_2D, 0, env.gl.RGBA, env.gl.RGBA, env.gl.UNSIGNED_BYTE, image);
    env.gl.generateMipmap(env.gl.TEXTURE_2D);
    env.gl.texParameteri(env.gl.TEXTURE_2D, env.gl.TEXTURE_MAG_FILTER, env.gl.LINEAR_MIPMAP_NEAREST);
    env.gl.texParameteri(env.gl.TEXTURE_2D, env.gl.TEXTURE_MIN_FILTER, env.gl.LINEAR_MIPMAP_NEAREST);
    env.gl.bindTexture(env.gl.TEXTURE_2D, null);
  };
  
  var setupTextures = function(env) {
    // cube tex
    env.woodTexture = env.gl.createTexture();
    loadImageForTexture(env, "textures/wood_128x128.jpg", env.woodTexture);
  };
  
  var setupMatrices = function(env) {
    env.modelViewMatrix = mat4.create();
    mat4.identity(env.modelViewMatrix);
    mat4.lookAt([1.5, 3.5, 8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], env.modelViewMatrix);
    mat4.translate(env.modelViewMatrix, [0.0, -0.2, 0.0], env.modelViewMatrix);
    
    env.projectionMatrix = mat4.create();        
    mat4.perspective(
      30, 
      env.gl.viewportWidth / env.gl.viewportHeight,
      0.1,
      100.0,
      env.projectionMatrix
    );  
    // stacks
    env.modelViewMatrixStack = [];      
  };
  
  var pushModelViewMatrix = function(env) {
    var copyToPush = mat4.create(env.modelViewMatrix);
    env.modelViewMatrixStack.push(copyToPush);
  };
  
  var popModelViewMatrix = function(env) {
    if(env.modelViewMatrixStack.lenght === 0) {
      console.error("error: cannot pop, env.modelViewMatrixStack stack is empty!");
    }
    env.modelViewMatrix = env.modelViewMatrixStack.pop();
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
    env.shaderProgram.vertexTextureAttribute = env.gl.getAttribLocation(env.shaderProgram, "aTextureCoordinates");
    env.shaderProgram.uniformSamplerLoc = env.gl.getUniformLocation(env.shaderProgram, "uSampler");
    
    // activate arrays
    env.gl.enableVertexAttribArray(env.shaderProgram.vertexPositionAttribute);
    env.gl.enableVertexAttribArray(env.shaderProgram.vertexTextureAttribute);    
  };
  
  var uploadModelViewMatrixToShader = function(env) {
    env.gl.uniformMatrix4fv(          
      env.gl.getUniformLocation(env.shaderProgram, "uMVMatrix"),
      false,
      env.modelViewMatrix
    );    
  };
  
  var uploadProjectionMatrixToShader = function(env) {
    env.gl.uniformMatrix4fv(
      env.gl.getUniformLocation(env.shaderProgram, "uPMatrix"), 
      false, 
      env.projectionMatrix
    );    
  };

  var startup = function(env) {
    if(window.gDebugContextLost) {
      env.canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(env.canvas);
      $("body").keypress({ "env" : env }, function(event) {
        if(event.keyCode == 13) {
          event.preventDefault();
          event.data.env.canvas.loseContext();
        }
      });
    }
    
    $(env.canvas)
     .on("webglcontextlost", { "env" : env }, onContextLost)
     .on("webglcontextrestored", { "env" : env }, onContextRestored);
                
    env.gl = window.gDebug ? WebGLDebugUtils.makeDebugContext(createGLContext(env.canvas)) : createGLContext(env.canvas);   
    
    setupShaders(env);
    setupBuffers(env);    
    setupTextures(env);
    
    env.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    env.gl.enable(env.gl.DEPTH_TEST);
    /*
    env.gl.disable(env.gl.DEPTH_TEST);
    env.gl.depthFunc(env.gl.LESS);
    env.gl.blendFunc(env.gl.SRC_ALPHA, env.gl.ONE);
    env.gl.enable(env.gl.BLEND);
    */
    /*
    env.gl.frontFace(env.gl.CCW);
    env.gl.enable(env.gl.CULL_FACE);
    env.gl.cullFace(env.gl.BACK);
    */
    //env.gl.disable(env.gl.CULL_FACE);
    
    // world
    setupMatrices(env);
    uploadModelViewMatrixToShader(env);
    uploadProjectionMatrixToShader(env);
    
    // set uSampler in fragment shader to have the value 0 so it matches the texture unit gl.TEXTURE0
    env.gl.uniform1i(env.shaderProgram.uniformSamplerLoc, 0);
    
    env.fpsCounter = $('#fps-counter')[0];    
  };
  
  var drawCube = function(env, texture) {
    // enable vertex buffer of the cube
    env.gl.bindBuffer(env.gl.ARRAY_BUFFER, env.cubeVertexPositionBuffer);

    // set ptr to the buffer
    env.gl.vertexAttribPointer(
      env.shaderProgram.vertexPositionAttribute,
      env.cubeVertexPositionBuffer.itemSize, 
      env.gl.FLOAT, 
      false, 
      0, 
      0
    );

    // enable index buffer for element draw
    env.gl.bindBuffer(env.gl.ELEMENT_ARRAY_BUFFER, env.cubeVertexIndexBuffer);

    // enable texture buffer
    env.gl.bindBuffer(env.gl.ARRAY_BUFFER, env.cubeVertexTextureCoordinateBuffer);
    
    // set ptr to texture buffer
    env.gl.vertexAttribPointer(
      env.shaderProgram.vertexTextureAttribute,
      env.cubeVertexTextureCoordinateBuffer.itemSize,
      env.gl.FLOAT,
      false,
      0,
      0
    );
    
    // activate + bind texture
    env.gl.activeTexture(env.gl.TEXTURE0);
    
    env.gl.bindTexture(env.gl.TEXTURE_2D, texture);

    // draw!
    env.gl.drawElements(
      env.gl.TRIANGLES, 
      env.cubeVertexIndexBuffer.numberOfItems, 
      env.gl.UNSIGNED_SHORT, 
      0
    );
  };
  
  var draw = function(env) {    
    // refresh    
    env.requestID = requestAnimFrame(function() {
      draw(env);
    });
    env.currentTime = Date.now();
        
    // compensate from varying frame rate    
    if(env.currentTime - env.previousFrameTimeStamp >= 1000) {      
      env.fpsCounter.innerHTML = env.nbrOfFramesForFPS;
      env.nbrOfFramesForFPS = 0;
      env.previousFrameTimeStamp = env.currentTime; 
    }
    
    // continue only if all textures were loaded
    if(env.ongoingImageLoads.length > 0) {
      return;
    }
    
    env.gl.viewport(0, 0, env.gl.viewportWidth, env.gl.viewportHeight);
    env.gl.clear(env.gl.COLOR_BUFFER_BIT | env.gl.DEPTH_BUFFER_BIT);
        
    // push transforms for the object that is to be drawn (object view)
    pushModelViewMatrix(env);

    if (env.animationStartTime === undefined) {
      env.animationStartTime = env.currentTime;
    }  
    
    mat4.rotate(env.modelViewMatrix, env.cubeRotationDegree, [0.0, 1.0, 0.0], env.modelViewMatrix);
    uploadModelViewMatrixToShader(env);    
    drawCube(env, env.woodTexture);
    popModelViewMatrix(env);
    
    env.cubeRotationDegree += 0.01;
    env.nbrOfFramesForFPS++;    
  };

  /* 
    although we now use the dom ready eventing of require instead of jquery this 
    block in block require is ugly. Maybe I can depower jQuery to some degree
    (noconflict, see http://requirejs.org/docs/jquery.html).
    Also I should setup a performance test to find the best loading order
  */
  require(['domReady'], function (domReady) {
    domReady(function () {
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
          
      startup(environment);
                  
      draw(environment);
    });
  });  
});



