define(['jquery',  'main'], function($) {
  return describe('webglapp', function() {
    beforeEach(function() {
      require(['main', 'domReady'], function() {

      });
    });

    it("should exists a canvas element", function() {
      expect($('#simplecanvas')[0]).toBeDefined();
    });

    console.debug("env", environment);

    it("should exsting an webgl environment", function() {
      expect(window.environment).toEqual(object);
    });
  });
});