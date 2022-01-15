// function that converts millsToMinutesAndSeconds
export default function millsToMinutesAndSeconds(mills) {
  var minutes = Math.floor(mills / 60000);
  var seconds = ((mills % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
