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

Todos afterwards
=============
* refactor texture handling
* add sub modules or classes to capsulate cube rendering => multiple objects!
* find algorithm for circle aligning multiple cubes ("Rondell")
* add multi-texturing to display product images onto cube fronts
* add mouse and keyboard handling for prev/next (+circular movement animation)
* do everything much more easy with a library or framework :)