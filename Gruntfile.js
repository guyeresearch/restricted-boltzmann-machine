module.exports = function(grunt) {

  grunt.initConfig({
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          },
          pretty: true
        },
        files: [{
          expand:true,
          src: ["*.jade"],
          dest:'./',
          ext:'.html'
        }]
      }
    },
    watch: {
      jade:{
        files:["*.jade"],
        tasks:["jade"]
      }
    },
    express:{
      dev:{
        options:{
          script:'index.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['watch']);

};
