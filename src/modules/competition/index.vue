<template>
  <div id="competitionPage" class="h-full w-full"></div>
</template>
<script>
export default {
  beforeRouteLeave(to, from, next) {
    this.removeScript();
    next();
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.loadScript();
    })
  },
  methods: {
    loadScript() {
      let iframeElement = document.createElement('iframe');
      iframeElement.setAttribute('id', 'competitionPageContainer')
      iframeElement.setAttribute('src', './competition/index.html');
      iframeElement.style = "width: 100%; height: 100%;";
      document.getElementById('competitionPage').appendChild(iframeElement);
    },
    removeScript() {
      var iframe = document.getElementById('competitionPageContainer');
      document.getElementById('competitionPage').removeChild(iframe);
    }
  }
}
</script>
<route>
    {
      meta: {
        i18n: 'competition',
        order: 3,
        icon: 'material-symbols:trophy',
        section: 2,
        weight: 'font-semibold',
        disabled: true
      }
    }
  </route>
