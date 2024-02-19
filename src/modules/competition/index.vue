
<template>
 <div id="root"></div>
</template>
<script>
export default {
    mounted() {
        let scriptElement = document.createElement('script')
        scriptElement.setAttribute('src', './competition/index-A8ICZHl2.js')
        document.head.appendChild(scriptElement)
        let stylesheetElement = document.createElement('link')
        stylesheetElement.setAttribute('rel', 'stylesheet')
        stylesheetElement.setAttribute('href', './competition/index-Ck6mM4fR.css')
        document.head.appendChild(stylesheetElement)
    },
}
</script>
<route>
    {
      meta: {
        i18n: 'competition',
        order: 3,
        icon: 'material-symbols:trophy',
        section: 2,
        weight: 'font-semibold'
      }
    }
  </route>
