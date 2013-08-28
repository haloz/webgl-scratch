webgl-scratch
=============

This is a little repository of mine for JavaScript based WebGL development. I planned this as a little project to develop a WebGL Cover Flow for products in an ecommerce shop.

Setup & Run
=============
* Setup IIS/Apache
* Add mime type for both shaders
** .vs => x-shader/x-vertex
** .fs => x-shader/x-fragment
* run: http://localhost/git/webgl-scratch/webgl-base/webgl.html
* smile :)

Todos
=============
* get DOM ready event handling into requireJS loader instead of extra jQuery document ready
* rewrite into class concept instead of loose functions
* split base renderer from actual application
* make base renderer a require module
* setup test driven development (Karma? Jasmine? JUnit?)
* split up base renderer into smaller classes
* unify all external dependencies via Git
* documentation for current state
* find better dom ready handling

Todos afterwards
=============
* refactor texture handling
* add sub modules or classes to capsulate cube rendering => multiple objects!
* find algorithm for circle aligning multiple cubes ("Rondell")
* add multi-texturing to display product images onto cube fronts
* add mouse and keyboard handling for prev/next (+circular movement animation)
* do everything much more easy with a library or framework :) 

Overall workflow
=============
* we have a canvas element
* our "startup" function creates a WebGL context onto that canvas using Google's external lib WebGLUtils
* this internally just does a browser wrapping for doing canvas.getContext("Browser-specific-GL-context-string", attributes);
* there's a demo shader with a VS/FS pair
* shaders are loaded via AJAX using jQuery
* together with shader compilation and linking => setupShaders function
* this function also assigns shader attributes like vertex buffer or texture
* next there's a setupBuffers. This creates a cube mesh using a vertex buffer in a Triangle list but also reusing vertices in a index buffer. And we also assign UV texture coordinates and a texture buffer
* setupTexture function then just loads textures via DOM and assigns them into texture samplers (gl.bindTexture...)
* we also need a stage, so we add a perspective camera using Model-View and Projection matrices
* finally in the rendering loop we clear the scene, push some nice rotation animation onto the matrix stack and draw our cube
* drawing the cube is mostly assigning pointers to our buffers onto the internal WebGL methods. Actual drawing is then just a gl.drawElements(...) call.

