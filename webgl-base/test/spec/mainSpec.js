requirejs.config({
  paths: {
    'jquery'     : 'jquery-2.0.3',
    'glmatrix'   : 'gl-matrix',
    'webgl-debug'  : 'webgl-debug',
    'webgl-utils'  : 'webgl-utils',
    'base-renderer' : 'base-renderer'
  }
});

define(['jquery', 'glmatrix', 'webgl-debug', 'webgl-utils', 'base-renderer'], function($) {
  "use strict";
  describe('base scenario', function() {
    it("should contain a canvas element", function() {
      expect($('#simplecanvas')[0]).toBeDefined();
    });
  });

  var environment = { 
    gl : undefined,
    canvas : $("#simplecanvas")[0],
  };
  var baseRenderer = new BaseRenderer(environment, $, 1);

  describe('The context handling', function() {    
    it("has a createContect function that should return a WebGL context", function() {
      expect(
        baseRenderer.createGLContext($("#simplecanvas")[0])
      ).toBeDefined();
    });

    it("should be able to create a valid gl context onto env.gl", function() {
      baseRenderer.env.gl = WebGLDebugUtils.makeDebugContext(
        baseRenderer.createGLContext(environment.canvas));
      expect(baseRenderer.env.gl).toBeDefined();   
    });       
  });

  describe('the shader loader', function() {
    var test_vs, test_fs;

    it("has a ajax function that loads and compiles a vertex shader", function() {
      test_vs = baseRenderer.loadShaderViaAjax('../shader/mycube.vs');
      expect(test_vs.toString()).toEqual('[object WebGLShader]');
    });

    it("has a ajax function that loads and compiles a fragment shader", function() {
      test_fs = baseRenderer.loadShaderViaAjax('../shader/mycube.fs');
      expect(test_fs.toString()).toEqual('[object WebGLShader]');
    });

    it("loads valid shaders that can be combined into a shader program", function() {
      var shaderProgram = baseRenderer.env.gl.createProgram();
      baseRenderer.env.gl.attachShader(shaderProgram, test_vs);
      baseRenderer.env.gl.attachShader(shaderProgram, test_fs);
      baseRenderer.env.gl.linkProgram(shaderProgram);
      expect(
        baseRenderer.env.gl.getProgramParameter(shaderProgram, baseRenderer.env.gl.LINK_STATUS)
      ).toBeDefined();      
      baseRenderer.env.gl.useProgram(shaderProgram);
    });
  });

});