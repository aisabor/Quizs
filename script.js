(function(){
  var svg = document.getElementById('chart');
  var patternSvg = document.getElementById('patternSvg');
  var priceEl = document.getElementById('price');
  var captionWrap = document.getElementById('captionWrap');
  var captionName = document.getElementById('captionName');
  var captionNote = document.getElementById('captionNote');
  var quiz = document.getElementById('quiz');
  var countdown = document.getElementById('countdown');
  var replayBtn = document.getElementById('replay');
  var btnUp = document.getElementById('btnUp');
  var btnDown = document.getElementById('btnDown');
  var scoreOut = document.getElementById('scoreOut');
  var diffBtns = document.querySelectorAll('.diffBtn');
  var tape = document.getElementById('tape');

  var candleW = 44, gap = 16, startX = 20;
  var chosen = null;
  var wins = 0, played = 0;
  var difficulty = 'all';
  var history = [];

  function neg(arr){ return arr.map(function(v){ return -v; }); }

  var DOUBLE_TOP_S = [0,300,900,1600,2400,1800,1100,1600,2350,1700,900,300,50];
  var DOUBLE_TOP_R = [-300,-900,-1600,-2100];
  var HS_S = [0,500,1000,400,1200,2300,1000,400,1100,900,400,200,0];
  var HS_R = [-500,-1100,-1800,-2400];
  var TRIPLE_TOP_S = [0,600,1900,1200,500,1850,1100,500,1900,1300,700,300,50];
  var TRIPLE_TOP_R = [-400,-1000,-1700,-2300];
  var BULL_FLAG_S = [0,700,1500,2300,3000,2900,2750,2850,2700,2600,2650,2550,2500];
  var BULL_FLAG_R = [2750,3100,3500,3950];
  var ASC_TRI_S = [0,950,500,980,650,1000,750,1000,820,1000,900,980,950];
  var ASC_TRI_R = [1200,1700,2200,2700];
  var RISING_WEDGE_S = [0,500,900,1000,1300,1450,1600,1700,1800,1850,1900,1930,1950];
  var RISING_WEDGE_R = [1700,1400,1000,600];
  var SUPPORT_BOUNCE_S = [0,-400,-900,-1400,-1800,-2100,-2000,-2150,-2050,-2100,-1950,-2080,-2000];
  var SUPPORT_BOUNCE_R = [-1600,-1100,-600,-100];
  var FAKE_BREAKOUT_S = [0,400,800,750,820,780,800,850,1000,1250,1150,1300,1350];
  var FAKE_BREAKOUT_R = [900,500,100,-400];

  var CUP_S = [0,-400,-1000,-1600,-2000,-2200,-2000,-1600,-1000,-400,100,-200,-300];
  var CUP_R = [200,700,1300,1900];
  var PENNANT_S = [0,800,1700,2600,3200,3000,2850,2950,2900,2925,2910,2920,2915];
  var PENNANT_R = [3200,3600,4100,4600];
  var SYM_TRI_S = [0,600,-300,500,-200,400,-150,350,-100,300,-50,250,0];
  var SYM_TRI_UP_R = [500,1000,1500,2000];
  var SYM_TRI_DOWN_R = [-500,-1000,-1500,-2000];
  var ROUND_BOTTOM_S = [0,-300,-600,-900,-1100,-1200,-1150,-1000,-750,-450,-150,100,250];
  var ROUND_BOTTOM_R = [600,1100,1700,2300];
  var BROADEN_TOP_S = [0,600,-400,900,-700,1200,-1000,1500,-1300,1100,-900,700,200];
  var BROADEN_TOP_R = [-500,-1000,-1600,-2200];
  var DIAMOND_TOP_S = [0,500,-200,800,-400,1000,-300,700,-100,400,50,200,100];
  var DIAMOND_TOP_R = [-400,-900,-1500,-2100];
  var THREE_DRIVES_S = [0,600,300,1100,700,1700,1200,2300,1800,2500,2100,2600,2300];
  var THREE_DRIVES_R = [1800,1200,500,-200];
  var BUMP_RUN_S = [0,200,400,600,900,1400,2200,3200,4000,3800,3500,3600,3400];
  var BUMP_RUN_R = [2800,2000,1000,0];
  var ISLAND_S = [0,150,1900,1950,2000,1980,2010,1990,2005,1995,180,120,60];
  var ISLAND_R = [-300,-700,-1200,-1700];
  var CHANNEL_S = [0,300,100,400,150,450,200,500,250,550,300,600,350];
  var CHANNEL_UP_R = [800,1400,2000,2600];
  var CHANNEL_DOWN_R = [-800,-1400,-2000,-2600];
  var EXPAND_WEDGE_S = [0,700,300,1200,600,1800,1000,2500,1500,3200,2100,3800,2700];
  var EXPAND_WEDGE_R = [1800,900,0,-900];
  var GAP_GO_S = [0,1200,1300,1250,1300,2400,2500,2450,2500,3500,3550,3500,3550];
  var GAP_GO_R = [3900,4300,4700,5100];

  var LIB = [
    {name:'double top', cat:'reversal', diff:'beginner', dir:'down', key:'high', setup:DOUBLE_TOP_S, reveal:DOUBLE_TOP_R, note:'Two failed attempts at the same high used up buying pressure, so sellers took over.'},
    {name:'double bottom', cat:'reversal', diff:'beginner', dir:'up', key:'low', setup:neg(DOUBLE_TOP_S), reveal:neg(DOUBLE_TOP_R), note:'Two failed attempts at the same low used up selling pressure, so buyers took over.'},
    {name:'head and shoulders', cat:'reversal', diff:'beginner', dir:'down', key:'high', setup:HS_S, reveal:HS_R, note:'A lower high on the right shoulder showed fading momentum after the head, and the neckline gave way.'},
    {name:'inverse head and shoulders', cat:'reversal', diff:'beginner', dir:'up', key:'low', setup:neg(HS_S), reveal:neg(HS_R), note:'A higher low on the right shoulder showed fading selling pressure after the head, and the neckline broke upward.'},
    {name:'triple top', cat:'reversal', diff:'intermediate', dir:'down', key:'high', setup:TRIPLE_TOP_S, reveal:TRIPLE_TOP_R, note:'Three failed tests of the same resistance is a stronger exhaustion signal than a double top.'},
    {name:'triple bottom', cat:'reversal', diff:'intermediate', dir:'up', key:'low', setup:neg(TRIPLE_TOP_S), reveal:neg(TRIPLE_TOP_R), note:'Three failed tests of the same support is a stronger exhaustion signal than a double bottom.'},
    {name:'bull flag', cat:'continuation', diff:'beginner', dir:'up', key:'range', setup:BULL_FLAG_S, reveal:BULL_FLAG_R, note:'A sharp rally followed by a calm, gently drifting pause. Breaks from that pause usually continue the prior trend.'},
    {name:'bear flag', cat:'continuation', diff:'beginner', dir:'down', key:'range', setup:neg(BULL_FLAG_S), reveal:neg(BULL_FLAG_R), note:'A sharp drop followed by a calm, gently drifting pause. Breaks from that pause usually continue the prior trend.'},
    {name:'ascending triangle', cat:'continuation', diff:'beginner', dir:'up', key:'high', setup:ASC_TRI_S, reveal:ASC_TRI_R, note:'Flat resistance above, rising higher lows below. Buyers kept getting more aggressive until they broke through.'},
    {name:'descending triangle', cat:'continuation', diff:'beginner', dir:'down', key:'low', setup:neg(ASC_TRI_S), reveal:neg(ASC_TRI_R), note:'Flat support below, falling lower highs above. Sellers kept getting more aggressive until they broke through.'},
    {name:'rising wedge', cat:'continuation', diff:'intermediate', dir:'down', key:'range', setup:RISING_WEDGE_S, reveal:RISING_WEDGE_R, note:'Price kept making new highs, but each rally got smaller. That fading momentum often flips into a breakdown.'},
    {name:'falling wedge', cat:'continuation', diff:'intermediate', dir:'up', key:'range', setup:neg(RISING_WEDGE_S), reveal:neg(RISING_WEDGE_R), note:'Price kept making new lows, but each drop got smaller. That fading momentum often flips into a breakout.'},
    {name:'support bounce', cat:'support and resistance', diff:'beginner', dir:'up', key:'low', setup:SUPPORT_BOUNCE_S, reveal:SUPPORT_BOUNCE_R, note:'Price tested the same floor repeatedly without breaking it, then rallied as sellers ran out of steam.'},
    {name:'resistance rejection', cat:'support and resistance', diff:'beginner', dir:'down', key:'high', setup:neg(SUPPORT_BOUNCE_S), reveal:neg(SUPPORT_BOUNCE_R), note:'Price tested the same ceiling repeatedly without breaking it, then dropped as buyers ran out of steam.'},
    {name:'fake breakout', cat:'breakout trap', diff:'intermediate', dir:'down', key:'high', setup:FAKE_BREAKOUT_S, reveal:FAKE_BREAKOUT_R, note:'Price poked above resistance and looked bullish, but did not hold the level and snapped back, trapping late buyers.'},
    {name:'fake breakdown', cat:'breakout trap', diff:'intermediate', dir:'up', key:'low', setup:neg(FAKE_BREAKOUT_S), reveal:neg(FAKE_BREAKOUT_R), note:'Price poked below support and looked bearish, but did not hold the level and snapped back, trapping late sellers.'},
    {name:'cup and handle', cat:'continuation', diff:'beginner', dir:'up', key:'range', setup:CUP_S, reveal:CUP_R, note:'A slow, rounded dip and recovery formed the cup, then a shallow pullback (the handle) let latecomers in before the breakout.'},
    {name:'inverse cup and handle', cat:'continuation', diff:'beginner', dir:'down', key:'range', setup:neg(CUP_S), reveal:neg(CUP_R), note:'A slow, rounded rally and pullback formed the cup, then a shallow bounce (the handle) trapped late buyers before the breakdown.'},
    {name:'bullish pennant', cat:'continuation', diff:'beginner', dir:'up', key:'range', setup:PENNANT_S, reveal:PENNANT_R, note:'A sharp rally paused in a tightening, symmetrical range as both sides ran out of conviction, then buyers pushed through.'},
    {name:'bearish pennant', cat:'continuation', diff:'beginner', dir:'down', key:'range', setup:neg(PENNANT_S), reveal:neg(PENNANT_R), note:'A sharp drop paused in a tightening, symmetrical range as both sides ran out of conviction, then sellers pushed through.'},
    {name:'symmetrical triangle breakout', cat:'continuation', diff:'intermediate', dir:'up', key:'range', setup:SYM_TRI_S, reveal:SYM_TRI_UP_R, note:'Highs and lows converged toward a point with no clear bias, and the coiled range finally resolved upward.'},
    {name:'symmetrical triangle breakdown', cat:'continuation', diff:'intermediate', dir:'down', key:'range', setup:SYM_TRI_S, reveal:SYM_TRI_DOWN_R, note:'Highs and lows converged toward a point with no clear bias, and the coiled range finally resolved downward.'},
    {name:'rounding bottom', cat:'reversal', diff:'beginner', dir:'up', key:'low', setup:ROUND_BOTTOM_S, reveal:ROUND_BOTTOM_R, note:'A gradual, saucer-shaped bottom showed selling pressure fading slowly rather than snapping, and buyers eased back in.'},
    {name:'rounding top', cat:'reversal', diff:'beginner', dir:'down', key:'high', setup:neg(ROUND_BOTTOM_S), reveal:neg(ROUND_BOTTOM_R), note:'A gradual, dome-shaped top showed buying pressure fading slowly rather than snapping, and sellers eased back in.'},
    {name:'broadening top', cat:'reversal', diff:'intermediate', dir:'down', key:'high', setup:BROADEN_TOP_S, reveal:BROADEN_TOP_R, note:'Swings got wider with each high and low, a sign of growing disagreement that usually ends in a breakdown.'},
    {name:'broadening bottom', cat:'reversal', diff:'intermediate', dir:'up', key:'low', setup:neg(BROADEN_TOP_S), reveal:neg(BROADEN_TOP_R), note:'Swings got wider with each high and low, a sign of growing disagreement that usually ends in a breakout.'},
    {name:'diamond top', cat:'reversal', diff:'intermediate', dir:'down', key:'high', setup:DIAMOND_TOP_S, reveal:DIAMOND_TOP_R, note:'The range widened and then narrowed into a diamond shape at the top, a rare but reliable exhaustion signal before a drop.'},
    {name:'diamond bottom', cat:'reversal', diff:'intermediate', dir:'up', key:'low', setup:neg(DIAMOND_TOP_S), reveal:neg(DIAMOND_TOP_R), note:'The range widened and then narrowed into a diamond shape at the bottom, a rare but reliable exhaustion signal before a rally.'},
    {name:'three drives down', cat:'reversal', diff:'intermediate', dir:'down', key:'high', setup:THREE_DRIVES_S, reveal:THREE_DRIVES_R, note:'Three successive higher peaks each ran out of steam faster than the last, and the third drive failed to hold.'},
    {name:'three drives up', cat:'reversal', diff:'intermediate', dir:'up', key:'low', setup:neg(THREE_DRIVES_S), reveal:neg(THREE_DRIVES_R), note:'Three successive lower troughs each ran out of steam faster than the last, and the third drive failed to hold.'},
    {name:'bump and run down', cat:'reversal', diff:'intermediate', dir:'down', key:'range', setup:BUMP_RUN_S, reveal:BUMP_RUN_R, note:'A slow lead-in gave way to a steep, unsustainable "bump," and price broke back below the original trendline.'},
    {name:'bump and run up', cat:'reversal', diff:'intermediate', dir:'up', key:'range', setup:neg(BUMP_RUN_S), reveal:neg(BUMP_RUN_R), note:'A slow lead-in gave way to a steep, unsustainable drop, and price broke back above the original trendline.'},
    {name:'island reversal top', cat:'reversal', diff:'intermediate', dir:'down', key:'range', setup:ISLAND_S, reveal:ISLAND_R, note:'A gap up stranded a small cluster of trading on an island, and a second gap down cut it off completely.'},
    {name:'island reversal bottom', cat:'reversal', diff:'intermediate', dir:'up', key:'range', setup:neg(ISLAND_S), reveal:neg(ISLAND_R), note:'A gap down stranded a small cluster of trading on an island, and a second gap up cut it off completely.'},
    {name:'channel breakout', cat:'continuation', diff:'beginner', dir:'up', key:'range', setup:CHANNEL_S, reveal:CHANNEL_UP_R, note:'Price respected a steady parallel channel for a while, then broke cleanly above the upper rail on rising momentum.'},
    {name:'channel breakdown', cat:'continuation', diff:'beginner', dir:'down', key:'range', setup:CHANNEL_S, reveal:CHANNEL_DOWN_R, note:'Price respected a steady parallel channel for a while, then broke cleanly below the lower rail on rising momentum.'},
    {name:'expanding wedge reversal down', cat:'reversal', diff:'intermediate', dir:'down', key:'range', setup:EXPAND_WEDGE_S, reveal:EXPAND_WEDGE_R, note:'Rallies and pullbacks both grew larger and more erratic, and that loss of control tipped into a sharp reversal down.'},
    {name:'expanding wedge reversal up', cat:'reversal', diff:'intermediate', dir:'up', key:'range', setup:neg(EXPAND_WEDGE_S), reveal:neg(EXPAND_WEDGE_R), note:'Drops and bounces both grew larger and more erratic, and that loss of control tipped into a sharp reversal up.'},
    {name:'gap and go up', cat:'continuation', diff:'beginner', dir:'up', key:'range', setup:GAP_GO_S, reveal:GAP_GO_R, note:'A strong breakout candle gapped away from the base, and each shallow pause afterward just fueled the next leg higher.'},
    {name:'gap and go down', cat:'continuation', diff:'beginner', dir:'down', key:'range', setup:neg(GAP_GO_S), reveal:neg(GAP_GO_R), note:'A strong breakdown candle gapped away from the base, and each shallow pause afterward just fueled the next leg lower.'}
  ];

  function pool(){
    if(difficulty === 'all') return LIB;
    return LIB.filter(function(p){ return p.diff === difficulty; });
  }

  var state = {};

  function buildSeries(def){
    var base = 61500;
    var pts1 = def.setup.map(function(d){ return base + d + (Math.random()-0.5)*250; });
    var lastShape = pts1[pts1.length-1];
    var pts2 = def.reveal.map(function(d){ return lastShape + d + (Math.random()-0.5)*200; });
    return pts1.concat(pts2);
  }

  function toCandles(prices){
    var arr = [];
    for(var i=0;i<prices.length-1;i++){
      var open = prices[i], close = prices[i+1];
      var high = Math.max(open,close) + (Math.random()*120);
      var low = Math.min(open,close) - (Math.random()*120);
      arr.push({open:open, close:close, high:high, low:low});
    }
    return arr;
  }

  function priceToY(p, min, max){
    return 592 - ((p - min) / (max - min)) * 564;
  }

  function gridLines(){
    return '<line x1="0" y1="155" x2="1160" y2="155" stroke="#2a2050" stroke-width="1"></line>' +
           '<line x1="0" y1="310" x2="1160" y2="310" stroke="#2a2050" stroke-width="1"></line>' +
           '<line x1="0" y1="465" x2="1160" y2="465" stroke="#2a2050" stroke-width="1"></line>';
  }

  function render(list, allForScale){
    svg.innerHTML = gridLines();
    var all = [];
    allForScale.forEach(function(c){ all.push(c.high, c.low); });
    var min = Math.min.apply(null, all) - 250;
    var max = Math.max.apply(null, all) + 250;
    list.forEach(function(c, i){
      var x = startX + i*(candleW+gap);
      var isUp = c.close >= c.open;
      var color = isUp ? '#2FE6A5' : '#FF5D78';
      var yHigh = priceToY(c.high, min, max);
      var yLow = priceToY(c.low, min, max);
      var yOpen = priceToY(c.open, min, max);
      var yClose = priceToY(c.close, min, max);
      var bodyTop = Math.min(yOpen, yClose);
      var bodyH = Math.max(Math.abs(yClose - yOpen), 3);
      var wick = document.createElementNS('http://www.w3.org/2000/svg','line');
      wick.setAttribute('x1', x+candleW/2); wick.setAttribute('x2', x+candleW/2);
      wick.setAttribute('y1', yHigh); wick.setAttribute('y2', yLow);
      wick.setAttribute('stroke', color); wick.setAttribute('stroke-width','2');
      svg.appendChild(wick);
      var body = document.createElementNS('http://www.w3.org/2000/svg','rect');
      body.setAttribute('x', x); body.setAttribute('y', bodyTop);
      body.setAttribute('width', candleW); body.setAttribute('height', bodyH);
      body.setAttribute('fill', color); body.setAttribute('rx','2');
      svg.appendChild(body);
    });
    priceEl.textContent = Math.round(list[list.length-1].close).toLocaleString();
    priceEl.style.color = list[list.length-1].close >= list[0].open ? '#2FE6A5' : '#FF5D78';
  }

  function showCaption(name, note){
    captionName.textContent = name;
    captionNote.textContent = note;
    captionWrap.style.opacity = '1';
  }
  function hideCaption(){ captionWrap.style.opacity = '0'; }

  function drawKeyLevel(def){
    var setupCandles = state.candles.slice(0, state.revealAt);
    var min = Math.min.apply(null, state.candles.map(function(c){return c.low;})) - 250;
    var max = Math.max.apply(null, state.candles.map(function(c){return c.high;})) + 250;
    patternSvg.innerHTML = '';
    var level;
    if(def.key === 'high'){
      level = Math.max.apply(null, setupCandles.map(function(c){return c.high;}));
    } else if(def.key === 'low'){
      level = Math.min.apply(null, setupCandles.map(function(c){return c.low;}));
    } else {
      level = setupCandles[setupCandles.length-1].close;
    }
    var y = priceToY(level, min, max);
    var lineEl = document.createElementNS('http://www.w3.org/2000/svg','line');
    lineEl.setAttribute('x1', 0); lineEl.setAttribute('y1', y);
    lineEl.setAttribute('x2', startX + state.revealAt*(candleW+gap)); lineEl.setAttribute('y2', y);
    lineEl.setAttribute('stroke', '#FFC94D'); lineEl.setAttribute('stroke-width','1.5'); lineEl.setAttribute('stroke-dasharray','4,4');
    patternSvg.appendChild(lineEl);
  }

  function pushTape(def, won){
    history.unshift({name:def.name, won:won});
    if(history.length > 20) history.pop();
    tape.innerHTML = '';
    history.forEach(function(h){
      var chip = document.createElement('div');
      chip.className = 'chip ' + (h.won ? 'win' : 'loss');
      chip.innerHTML = (h.won ? '✓ ' : '✕ ') + '<b>' + h.name + '</b>';
      tape.appendChild(chip);
    });
  }

  function newRound(){
    replayBtn.style.display = 'none';
    quiz.style.display = 'none';
    patternSvg.innerHTML = '';
    chosen = null;
    btnUp.style.outline = ''; btnDown.style.outline = '';
    hideCaption();

    var candidates = pool();
    var def = candidates[Math.floor(Math.random()*candidates.length)];
    var series = buildSeries(def);
    var candles = toCandles(series);
    var setupLen = toCandles(def.setup.slice()).length;
    state = { def: def, candles: candles, revealAt: setupLen };

    var step = 0;
    var iv = setInterval(function(){
      step++;
      render(candles.slice(0, step), candles);
      if(step >= state.revealAt){
        clearInterval(iv);
        drawKeyLevel(def);
        setTimeout(askQuestion, 400);
      }
    }, 120);
  }

  function askQuestion(){
    quiz.style.display = 'flex';
    countdown.textContent = '';
  }

  function lockChoice(dir){
    if(chosen) return;
    chosen = dir;
    if(dir === 'up'){ btnUp.style.outline = '2px solid #fff'; }
    else { btnDown.style.outline = '2px solid #fff'; }
    var n = 3;
    countdown.textContent = n;
    var iv = setInterval(function(){
      n--;
      if(n <= 0){
        clearInterval(iv);
        revealAnswer();
      } else {
        countdown.textContent = n;
      }
    }, 650);
  }

  function revealAnswer(){
    quiz.style.display = 'none';
    var step = state.revealAt;
    var iv = setInterval(function(){
      step++;
      render(state.candles.slice(0, step), state.candles);
      if(step >= state.candles.length){
        clearInterval(iv);
        var def = state.def;
        var won = chosen === def.dir;
        played++;
        if(won){ wins++; }
        scoreOut.textContent = wins + ' / ' + played;
        var label = (won ? 'Correct — ' : 'It went ' + def.dir + ' — ') + def.name + ' (' + def.cat + ')';
        showCaption(label, def.note);
        pushTape(def, won);
        setTimeout(function(){ replayBtn.style.display = 'inline-flex'; }, 1200);
      }
    }, 130);
  }

  diffBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      difficulty = btn.getAttribute('data-diff');
      diffBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      newRound();
    });
  });

  btnUp.addEventListener('click', function(){ lockChoice('up'); });
  btnDown.addEventListener('click', function(){ lockChoice('down'); });
  replayBtn.addEventListener('click', newRound);
  newRound();
})();
