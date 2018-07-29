export default function register($elem) {
  const avro = window.AvroPhonetic(
    function() {
      return {}
    },
    function(candidates) {
      console.log(candidates)
    }
  )


}
