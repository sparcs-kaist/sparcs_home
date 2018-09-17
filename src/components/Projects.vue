<template>
  <div>
    <div id="project-header" class="ui vertical masthead center aligned basic segment">
      <div class="ui text container">
        <h1 class="ui header" style="color: #ffffff;">Service, That Will Move You</h1>
        <h2>SPARCS에서 런칭되고 있는 서비스, 프로젝트들을 만나보세요!</h2>
      </div>
    </div>
    <div class="ui container">
      <div class="ui stackable center aligned three column grid">
        <div
          v-for="project in projects"
          class="column"
        >
          <div style="width: 80%; margin: 10%;">
            <img
              class="ui small centered image"
              src="./../../static/project-icon.png"
            />
            <h2 class="ui header">
              {{project.title}}
            </h2>
            <div class="sub header">PM : {{project.pm}}</div>
            <br>
            {{project.description}}
            <br><br>
            <a
              v-if="project.homepage"
              :href="project.homepage"
            >
              <div style="display: inline;">
                <i class="big home icon link icon" style="color: black;"></i>
              </div>
            </a>
            <a
              v-if="project.github"
              :href="project.github"
            >
              <div style="display: inline;">
                <i class="big github alternate icon link icon" style="color: black;"></i>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as projects from '../text/projects';

  export default {
    name: 'Projects',
    data: () => ({
      projects: [],
    }),

    created() {
      this.projects = JSON.parse(projects);
    },

    mounted() {
      document.getElementById('projects').classList.add('active');
      // we gave marginTop of r_view when righ menu item is clicked, so reload doesn't take this action
      const width = $(window).width();
      if (width <= 600) {
        document.getElementById('r_view').style.marginTop = '49px';
      } else {
        document.getElementById('r_view').style.marginTop = '85px';
      }
      document.getElementById('menu_header').style.backgroundColor = 'rgba(0,0,0,1)';
    },
  };
</script>

<style>
  #project-header {
    background-image: url('../../static/mesh03.png');
    color: #ffffff;
  }
</style>
