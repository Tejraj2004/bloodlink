export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blood: { 50:'#fff1f1',100:'#ffe1e1',200:'#ffc7c7',300:'#ffa0a0',400:'#ff6b6b',500:'#f83b3b',600:'#e51d1d',700:'#c11414',800:'#a01414',900:'#841818',950:'#480808' },
        slate: { 850:'#1a2235' }
      },
      fontFamily: { sans:['Inter','system-ui','sans-serif'], display:['Sora','Inter','sans-serif'] }
    }
  },
  plugins: []
}
