require.config({
	baseUrl : '../js/',
	paths: {
		'jquery'     	 : 'jquery-2.0.3',
	  'glmatrix'   	 : 'gl-matrix',
	  'webgl-debug'  : 'webgl-debug',
	  'webgl-utils'  : 'webgl-utils',
	  'jasmine' 		 : 'jasmine',
		'jasmine-html' : 'jasmine-html',
    'spec' 			   : '../test/spec'	
  },
	shim: {
		jasmine: {
    		exports: 'jasmine'
    	},
    	'jasmine-html': {
      		deps: ['jasmine'],
      		exports: 'jasmine'
    	}
	}
});

require(['jquery', 'jasmine-html', 'domReady', 'glmatrix', 'webgl-debug', 'webgl-utils'], function($, jasmine, domReady) {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
 
  var htmlReporter = new jasmine.HtmlReporter();
 
  jasmineEnv.addReporter(htmlReporter);
 
  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };
 
  var specs = [];
 
  specs.push('spec/mainSpec'); 
 
  $(function(){
    require(specs, function(){
      jasmineEnv.execute();
    });
  });
 
});