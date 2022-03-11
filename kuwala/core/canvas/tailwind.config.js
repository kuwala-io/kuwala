module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'kuwala-red': '#F5989D',
        'kuwala-green': '#00A99D',
        'kuwala-bg-gray': '#F9F9F9',
        'kuwala-light-green': '#00A99D',
      }
    },
  },
  plugins: [
    require('tw-elements/dist/plugin')
  ]
}