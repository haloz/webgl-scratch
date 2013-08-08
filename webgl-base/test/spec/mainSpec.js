define(['jQuery', 'main'], function($) {
  describe('base scenario', function() {
    it("should exists a canvas element", function() {
      expect($('#simplecanvas')[0]).toBeDefined();
    });

    it("should")

    console.debug("env", environment);

    it("should exsting an webgl environment", function() {
      expect(window.environment).toEqual(object);
    });
  });

  describe('the baseRenderer function test', function() {
    var baseRenderer;

    beforeEach(function() {
      baseRenderer = new BaseRenderer(1, jQuery); 
    });

    it("has a createContect function that returns a WebGL context", function() {
      expect(
        baseRenderer.createGLContext($("#simplecanvas")[0])
        .toBeDefined()
      );
    });
  });
});