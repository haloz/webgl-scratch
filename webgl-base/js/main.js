var gDebug = 0;

requirejs.config({
	paths: {
		'jquery'   		: gDebug ? 'jquery-1.8.3' : 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
		'glmatrix' 		: gDebug ? 'gl-matrix' : 'gl-matrix-min',
		'webgl-debug'	: 'webgl-debug'
	}	
});

require(['jquery', 'glmatrix', (gDebug ? 'webgl-debug' : '')], function($){
	console.debug("jquery loaded:", $);
	
	var createGLContext = function(canvas) {
		var context = null;
		if(!window.WebGLRenderingContext) {
		  alert("Get a WebGL browser at http://get.webgl.org");
		  return null;
		}
		$.each(["webgl", "experimental-webgl"], function(undefined, element) {
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
         0.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         0.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
         1.0,  1.0, -1.0
      ],
      itemCount = triangleVertices.length / 3; 
    env.gl.bufferData(env.gl.ARRAY_BUFFER, new Float32Array(triangleVertices), env.gl.STATIC_DRAW);
    env.vertexBuffer.itemSize = 3;      // size of an item, always 3 verts per triangle with buffered strip
    env.vertexBuffer.numberOfItems = itemCount;                        
  };
  
  var setupMatrices = function(env) {
  	env.modelViewMatrix = mat4.create();
    mat4.identity(env.modelViewMatrix);
    mat4.lookAt([3.0, 4.0, -10.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], env.modelViewMatrix);
    
  	env.projectionMatrix = mat4.create();        
    mat4.perspective(
      45, 
      env.gl.viewportWidth / env.gl.viewportHeight,
      1.0,
      10000.0,
      env.projectionMatrix
    );    
  };

  var loadShaderFromDOM = function(env, id) {
    var shaderNode = $("#"+id);
    if(!shaderNode) {
      return null; 
    }
    var shader = env.gl.createShader(
      shaderNode.attr("type") == "x-shader/x-vertex" ? env.gl.VERTEX_SHADER : env.gl.FRAGMENT_SHADER
    );
    env.gl.shaderSource(shader, shaderNode.text());
    env.gl.compileShader(shader);
    
    if(!env.gl.getShaderParameter(shader, env.gl.COMPILE_STATUS)) {
      alert(env.gl.getShaderInfoLog(shader));
    }
    return shader;
  };
  
  var setupShaders = function(env) {
  	// load shader code
    var vertexShader = loadShaderFromDOM(env, "shader-vs"),
        fragmentShader = loadShaderFromDOM(env, "shader-fs");

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
  };

	var startup = function(env) {
		console.debug("gdebug", gDebug, "jq", $);
		env.canvas = $("#simplecanvas")[0];		
		env.gl = gDebug ? WebGLDebugUtils.makeDebugContext(createGLContext(env.canvas)) : createGLContext(env.canvas);
		
		setupMatrices(env);
    setupShaders(env);
    setupBuffers(env);		
		
		env.gl.clearColor(0.0, 1.0, 0.0, 1.0);
	};	
	
  var draw = function(env) {
    env.gl.clear(env.gl.COLOR_BUFFER_BIT);
    env.gl.vertexAttribPointer(
      env.shaderProgram.vertexPositionAttribute, 
      env.vertexBuffer.itemSize, 
      env.gl.FLOAT,
      false,
      0,
      0
    );
    env.gl.enableVertexAttribArray(env.shaderProgram.vertexPositionAttribute);
    env.gl.drawArrays(env.gl.TRIANGLE_STRIP, 0, env.vertexBuffer.numberOfItems);
  };	

	// ---------------------------

	$(document).ready(function() {
		"use strict";
		console.debug("dom ready");
			
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
