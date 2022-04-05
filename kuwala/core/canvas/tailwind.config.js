

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
        'kuwala-gray': '#BDBDBD',
        'kuwala-light-green': '#99DDD8',
        'kuwala-purple': '#8B83BA',
      },
      spacing: {
        '92': '26rem',
        '100': '28rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },
      height: theme => ({
        "1/12": "calc(1/12 * 100%)",
        "2/12": "calc(2/12 * 100%)",
        "3/12": "calc(3/12 * 100%)",
        "4/12": "calc(4/12 * 100%)",
        "5/12": "calc(5/12 * 100%)",
        "6/12": "calc(6/12 * 100%)",
        "7/12": "calc(7/12 * 100%)",
        "8/12": "calc(8/12 * 100%)",
        "9/12": "calc(9/12 * 100%)",
        "10/12": "calc(10/12 * 100%)",
        "11/12": "calc(11/12 * 100%)",
      }),
      maxHeight: theme => ({
        "1/12": "calc(1/12 * 100%)",
        "2/12": "calc(2/12 * 100%)",
        "3/12": "calc(3/12 * 100%)",
        "4/12": "calc(4/12 * 100%)",
        "5/12": "calc(5/12 * 100%)",
        "6/12": "calc(6/12 * 100%)",
        "7/12": "calc(7/12 * 100%)",
        "8/12": "calc(8/12 * 100%)",
        "9/12": "calc(9/12 * 100%)",
        "10/12": "calc(10/12 * 100%)",
        "11/12": "calc(11/12 * 100%)",
      }),
    },
  },
  plugins: [
    require('tw-elements/dist/plugin')
  ]
}