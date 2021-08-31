const id = '15sEuDqyqvvCVB2zs9A3BMhb4XtDvSM-BwZTJpRnNJVo';
const gid = '0';
const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/'+id+'/gviz/tq?tqx=out:json&tq&gid='+gid;

let performances;
let songs;
let selectedSong;

// From https://stackoverflow.com/a/3177838
function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function distinctSongs() {
  songs = performances.map(s => `${s.song} (${s.version})`)
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .sort();
}

function renderSongSelect() {
  const $songSearch = $('#song-search').select2({
    theme: 'bootstrap',
    placeholder: {
      id: '-1',
      text: 'Select a song'
    },
    data: songs.map(s => ({id: s, text: s}))
  }).on('select2:select', e => {
    if (e.params && e.params.data.id) {
      selectedSong = e.params.data.id;
    }
    if (selectedSong) {
      renderSongTable();
      renderSongTimeline();
    }
    return true;
  });
  $songSearch.show();
  // As first option is already selected
  $songSearch.trigger('select2:select');
}

function renderSongTable() {
  const selected = performances.filter(p => `${p.song} (${p.version})` === selectedSong);
  const grouped = selected.reduce((result, item) => {
    if (!result[item.worshipLeader]) {
      result[item.worshipLeader] = {};
    }
    if (!result[item.worshipLeader][item.key]) {
      result[item.worshipLeader][item.key] = {
        count: 0,
        lastSung: item.date,
      };
    }
    result[item.worshipLeader][item.key].count += 1;
    if (result[item.worshipLeader][item.key].lastSung < item.date) {
      result[item.worshipLeader][item.key].lastSung = item.date;
    }
    return result;
  }, {});
  const html = Object.keys(grouped).sort().map(wl => {
    return Object.keys(grouped[wl]).sort().map(key => {
      const item = grouped[wl][key];
      const lastSung = `${timeSince(item.lastSung)} ago`;
      return `<tr><td>${wl}</td><td>${key}</td><td>${item.count}</td><td>${lastSung}</td></tr>`;
    });
  }).join('');
  $('#song-table-body').html(html);
  $('#song-table').show();
}

function renderSongTimeline() {
  const selected = performances.filter(p => `${p.song} (${p.version})` === selectedSong);
  const dates = selected.map(s => s.date)
    .filter(d => d > oneYearAgo);
  $('#timeline-section').show();
  let sungTimes;
  if (dates.length === 1) {
    sungTimes = 'Once';
  } else if (dates.length === 2) {
    sungTimes = 'Twice';
  } else {
    sungTimes = `${dates.length} times`;
  }
  sungTimes += ' in the past year';
  $('#sung-times').html(sungTimes);
  addCircles(dates);
}

fetch(spreadsheetUrl)
  .then(response => {
    if (response.ok) {
      response.text().then(data => {
        data = data.substring(47).slice(0, -2);
        data = JSON.parse(data);
        // Transform Google Sheets data structure
        const rows = data.table.rows.map(row => {
          return {
            date: new Date(row.c[0].f),
            song: row.c[1].v,
            version: row.c[2].v,
            worshipLeader: row.c[3]?.v,
            key: row.c[4]?.v
          }
        });
        performances = rows;
        distinctSongs();
        renderSongSelect();
      });
    } else {
      console.error('Could not read data feed');
    }
  });

