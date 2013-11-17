/**
 * @class BaseRenderer
*/

var BaseRenderer = function BaseRenderer(environment, param_jQuery, param_debug) {	
	this.gDebugContextLost = 0;
	this.gDebug = param_debug;
	this.jQuery = param_jQuery;
	this.env = environment;
}

BaseRenderer.prototype = {
    /**
     * Using Google's WebGLUtils library create a WebGL context on the supplied canvas
     * 
     * @method createGLContext
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	createGLContext : function(canvas) {
		var context = WebGLUtils.setupWebGL(canvas);
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;     
		return context;
	},

    /**
     * Event handler sink for handling GL contextlost events.
     * Stops image loading a rendering loop.
     * 
     * @method onContextLost
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	onContextLost : function(event) {  
	  // event.data.env
	  event.preventDefault();
	  cancelAnimFrame(event.data.env.requestID);
	  
	  // Ignore all ongoing image loads by removing their onload handler
	  for(var i = 0; i < event.data.env.ongoingImageLoads.length; i++) {
	   event.data.env.ongoingImageLoads[i].onload = undefined;
	  }
	  event.data.env.ongoingImageLoads = [];    
	},

    /**
     * Event handler sink for handling GL contextrestored events.
     * Re-runs startup and starts rendering loop.
     * 
     * @method onContextRestored
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	onContextRestored : function(event) {	  
	  this.startup(event.data.env);    
	  this.draw(event.data.env);   
	},

    /**
     * Creates and fills vertex and index buffers for demo mesh.
     * Assignes texture UV coordinates into a texture coords buffer.
     * 
     * @method setupBuffers
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */	  
	setupBuffers : function(env) {
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
	},
	  
    /**
     * Triggers loading of a texture image. Attaches the async loading job into a queue.
     * Loading events are then fetched by onTextureFinishLoading.
     * 
     * @method loadImageForTexture
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */	  
	loadImageForTexture : function(env, url, texture) {
	  var img = this.jQuery("<img/>").attr("src", url);
	  env.ongoingImageLoads.push(img);
	  var _this = this;
	  this.jQuery(img).on("load", { "env" : env, "texture" : texture }, function(event){
	    env.ongoingImageLoads.splice(env.ongoingImageLoads.indexOf(this), 1);
	    _this.onTextureFinishLoading(event.data.env, this, event.data.texture);
	  });    
	},
	  
    /**
     * Event sink for successfully loaded texture images.
     * Integrates and assignes the texture to the supplied texture object.
     * 
     * @method onTextureFinishLoading
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */	
	onTextureFinishLoading : function(env, image, texture) {
	  env.gl.bindTexture(env.gl.TEXTURE_2D, texture);
	  env.gl.pixelStorei(env.gl.UNPACK_FLIP_Y_WEBGL, true);
	  env.gl.texImage2D(env.gl.TEXTURE_2D, 0, env.gl.RGBA, env.gl.RGBA, env.gl.UNSIGNED_BYTE, image);
	  env.gl.generateMipmap(env.gl.TEXTURE_2D);
	  env.gl.texParameteri(env.gl.TEXTURE_2D, env.gl.TEXTURE_MAG_FILTER, env.gl.LINEAR_MIPMAP_NEAREST);
	  env.gl.texParameteri(env.gl.TEXTURE_2D, env.gl.TEXTURE_MIN_FILTER, env.gl.LINEAR_MIPMAP_NEAREST);
	  env.gl.bindTexture(env.gl.TEXTURE_2D, null);
	},

    /**
     * Loads and assigns a demo texture.
     * 
     * @method setupTextures
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */		 
	setupTextures : function(env) {
	  // cube tex
	  env.woodTexture = env.gl.createTexture();
	  this.loadImageForTexture(env, "textures/wood_128x128.jpg", env.woodTexture);
	},

    /**
     * Setup for the demo scene. Creates a perspective camera.
     * 
     * @method setupMatrices
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */			  
	setupMatrices : function(env) {
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
	},

    /**
     * Adds a new matrix for the Model-View stack.
     * 
     * @method pushModelViewMatrix
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */	
	pushModelViewMatrix : function(env) {
	  var copyToPush = mat4.create(env.modelViewMatrix);
	  env.modelViewMatrixStack.push(copyToPush);
	},

    /**
     * Pops the last matrix from the Model-View stack.
     * 
     * @method popModelViewMatrix
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	popModelViewMatrix : function(env) {
	  if(env.modelViewMatrixStack.lenght === 0) {
	    console.error("error: cannot pop, env.modelViewMatrixStack stack is empty!");
	  }
	  env.modelViewMatrix = env.modelViewMatrixStack.pop();
	},

    /**
     * Use jQuery to load a shader. Also compiles the shader.
     * Loading is done synchronous.
     * 
     * @method loadShaderViaAjax
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	loadShaderViaAjax : function(filename) {  
	  var shader;
	  var _this = this;                      
	  this.jQuery.ajax({
	    async: false,
	    url: filename,
	    success: function (data) {
	      var jqdata = _this.jQuery(data),      
	          shaderType = jqdata.attr("type") === "x-shader/x-vertex" ? _this.env.gl.VERTEX_SHADER : _this.env.gl.FRAGMENT_SHADER,
	          shaderSource = jqdata.html();
	            
	      shader = _this.env.gl.createShader(shaderType);
	      _this.env.gl.shaderSource(shader, shaderSource);
	      _this.env.gl.compileShader(shader);
	      
	      if(!_this.env.gl.getShaderParameter(shader, _this.env.gl.COMPILE_STATUS)) {
	        alert(_this.env.gl.getShaderInfoLog(shader));
	      }      
	    },
	    dataType: 'html'
	  });
	  return shader;
	},

    /**
     * Loads the shaders for our Demo mesh. Compiles a shader program
     * from a VS+FS. Supplies vertex-, index-, texture-buffers to the 
     * shader program.
     * 
     * @method setupShaders
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	setupShaders : function() {
	  // load shader code
	  var vertexShader = this.loadShaderViaAjax('shader/mycube.vs'),
	      fragmentShader = this.loadShaderViaAjax('shader/mycube.fs');

	  // compile shaders
	  this.env.shaderProgram = this.env.gl.createProgram();
	  this.env.gl.attachShader(this.env.shaderProgram, vertexShader);
	  this.env.gl.attachShader(this.env.shaderProgram, fragmentShader);
	  this.env.gl.linkProgram(this.env.shaderProgram);
	  if(!this.env.gl.getProgramParameter(this.env.shaderProgram, this.env.gl.LINK_STATUS)) {
	    alert("Failed to setup shaders");
	  }
	  this.env.gl.useProgram(this.env.shaderProgram);
	          
	  // assign variables to shaders
	  this.env.shaderProgram.vertexPositionAttribute = this.env.gl.getAttribLocation(this.env.shaderProgram, "aVertexPosition");
	  this.env.shaderProgram.vertexTextureAttribute = this.env.gl.getAttribLocation(this.env.shaderProgram, "aTextureCoordinates");
	  this.env.shaderProgram.uniformSamplerLoc = this.env.gl.getUniformLocation(this.env.shaderProgram, "uSampler");
	  
	  // activate arrays
	  this.env.gl.enableVertexAttribArray(this.env.shaderProgram.vertexPositionAttribute);
	  this.env.gl.enableVertexAttribArray(this.env.shaderProgram.vertexTextureAttribute);    
	},

    /**
     * Sends the current Model-View matrix to the shader program.
     * 
     * @method uploadModelViewMatrixToShader
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	uploadModelViewMatrixToShader : function() {
	  this.env.gl.uniformMatrix4fv(          
	    this.env.gl.getUniformLocation(this.env.shaderProgram, "uMVMatrix"),
	    false,
	    this.env.modelViewMatrix
	  );    
	},

    /**
     * Sends the current Projection matrix to the shader program.
     * 
     * @method uploadProjectionMatrixToShader
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	uploadProjectionMatrixToShader : function() {
	  this.env.gl.uniformMatrix4fv(
	    this.env.gl.getUniformLocation(this.env.shaderProgram, "uPMatrix"), 
	    false, 
	    this.env.projectionMatrix
	  );    
	},

    /**
     * Post-constructor setup method. Makes demo world ready for draw.
     * 
     * @method startup
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	startup : function() {
	  if(this.gDebugContextLost) {
	    this.env.canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(this.env.canvas);
	    this.jQuery("body").keypress({ "env" : this.env }, function(event) {
	      console.debug("keypressed", event.keyCode);
	      if(event.keyCode == 13) {
	        event.preventDefault();
	        console.debug("screwing gl context...");
	        event.data.env.canvas.loseContext();
	      }
	    });
	  }

	  this.jQuery(this.env.canvas)
	   .on("webglcontextlost", { "env" : this.env }, this.onContextLost)
	   .on("webglcontextrestored", { "env" : this.env }, this.onContextRestored);
	              
	  this.env.gl = this.gDebug ? 
	  	WebGLDebugUtils.makeDebugContext(this.createGLContext(this.env.canvas)) : 
	  	this.createGLContext(this.env.canvas);   
	  
	  this.setupShaders();
	  this.setupBuffers(this.env);    
	  this.setupTextures(this.env);
	  
	  this.env.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	  this.env.gl.enable(this.env.gl.DEPTH_TEST);
	  
	  // world
	  this.setupMatrices(this.env);
	  this.uploadModelViewMatrixToShader();
	  this.uploadProjectionMatrixToShader();
	  
	  // set uSampler in fragment shader to have the value 0 so it matches the texture unit gl.TEXTURE0
	  this.env.gl.uniform1i(this.env.shaderProgram.uniformSamplerLoc, 0);
	  
	  this.env.fpsCounter = this.jQuery('#fps-counter')[0];    

	  // todo: use the env member variable everywhere instead of function parameters
	  //this.env = env;
	},

    /**
     * Draws a cube with the filled cube vertex-, index-, texture-buffers.
     * 
     * @method drawCube
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	drawCube : function(texture) {
	  // enable vertex buffer of the cube
	  this.env.gl.bindBuffer(this.env.gl.ARRAY_BUFFER, this.env.cubeVertexPositionBuffer);

	  // set ptr to the buffer
	  this.env.gl.vertexAttribPointer(
	    this.env.shaderProgram.vertexPositionAttribute,
	    this.env.cubeVertexPositionBuffer.itemSize, 
	    this.env.gl.FLOAT, 
	    false, 
	    0, 
	    0
	  );

	  // enable index buffer for element draw
	  this.env.gl.bindBuffer(this.env.gl.ELEMENT_ARRAY_BUFFER, this.env.cubeVertexIndexBuffer);

	  // enable texture buffer
	  this.env.gl.bindBuffer(this.env.gl.ARRAY_BUFFER, this.env.cubeVertexTextureCoordinateBuffer);
	  
	  // set ptr to texture buffer
	  this.env.gl.vertexAttribPointer(
	    this.env.shaderProgram.vertexTextureAttribute,
	    this.env.cubeVertexTextureCoordinateBuffer.itemSize,
	    this.env.gl.FLOAT,
	    false,
	    0,
	    0
	  );
	  
	  // activate + bind texture
	  this.env.gl.activeTexture(this.env.gl.TEXTURE0);
	  
	  this.env.gl.bindTexture(this.env.gl.TEXTURE_2D, texture);

	  // draw!
	  this.env.gl.drawElements(
	    this.env.gl.TRIANGLES, 
	    this.env.cubeVertexIndexBuffer.numberOfItems, 
	    this.env.gl.UNSIGNED_SHORT, 
	    0
	  );
	},

    /**
     * Rendering loop method. Uses browser-internal 
     * "requestAnimFrame" method for fast drawing.
     * Compensates framedrops with time segmenting.
     * Draws our demo mesh and lets it rotate a bit ^^.
     * 
     * @method draw
     * @member BaseRenderer
     * 
     * @since 0.0.1
     */
	draw : function() {
		var _this = this;    
	  // refresh    
	  this.env.requestID = requestAnimFrame(function() {
	    _this.draw();
	  });
	  this.env.currentTime = Date.now();
	      
	  // compensate from varying frame rate    
	  if(this.env.currentTime - this.env.previousFrameTimeStamp >= 1000) {      
	    this.env.fpsCounter.innerHTML = this.env.nbrOfFramesForFPS;
	    this.env.nbrOfFramesForFPS = 0;
	    this.env.previousFrameTimeStamp = this.env.currentTime; 
	  }
	  
	  // continue only if all textures were loaded
	  if(this.env.ongoingImageLoads.length > 0) {
	    return;
	  }
	  
	  this.env.gl.viewport(0, 0, this.env.gl.viewportWidth, this.env.gl.viewportHeight);
	  this.env.gl.clear(this.env.gl.COLOR_BUFFER_BIT | this.env.gl.DEPTH_BUFFER_BIT);
	      
	  // push transforms for the object that is to be drawn (object view)
	  this.pushModelViewMatrix(this.env);

	  if (this.env.animationStartTime === undefined) {
	    this.env.animationStartTime = this.env.currentTime;
	  }  
	  
	  mat4.rotate(
	  	this.env.modelViewMatrix, 
	  	this.env.cubeRotationDegree, 
	  	[0.0, 1.0, 0.0], 
	  	this.env.modelViewMatrix
	  );
	  this.uploadModelViewMatrixToShader();    
	  this.drawCube(this.env.woodTexture);
	  this.popModelViewMatrix(this.env);
	  
	  this.env.cubeRotationDegree += 0.01;
	  this.env.nbrOfFramesForFPS++;    
	}
};
