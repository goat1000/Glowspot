/**
 * Copyright (C) 2011-2013 Graham Breach
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Glowspot 1.1.1
 * For more information, please contact <graham@goat1000.com>
 */
(function() {
  var c, r, i, prev = {}, list = '', durl, bk = 'background',
    bgrepeat = bk + '-repeat', bgattach = bk + '-attachment',
    bgpos = bk + '-position', bgposx = bgpos + '-x', bgposy = bgpos + '-y',
    bgimage = bk + '-image', doc = document, propre = /\-([a-z])/g,
    props = [bk + '-color',bgrepeat,bgattach,bgposx,bgposy,bgpos,bgimage],
    propslen = 7, opts = { colour: '255,255,255', size: 180, intensity: 0.9},
    commasp = ', ', camelised = {};

  function UpperSecond(a) {
    return a[1].toUpperCase();
  }

  function Camel(p) {
    return camelised[p] || (camelised[p] = p.replace(propre,UpperSecond));
  }

  function GetProperty(e,p) {
    var dv = doc.defaultView;
    return (dv && dv.getComputedStyle && dv.getComputedStyle(e,null).getPropertyValue(p)) ||
      (e.currentStyle && e.currentStyle[Camel(p)]);
  }

  function SetProperty(e,p,v) {
    e.style[Camel(p)] = v;
  }

  /**
   * This function works around some strangeness from IE9 - it supports
   * background-position, but doesn't always return the correct value.
   * background-position-x does return the correct value, so we can use it
   * to build the correct position.
   */
  function getList(prev) {
    var pos = prev[bgpos], posX = prev[bgposx],
      posY = prev[bgposy], l = commasp, s1, s2, s3, s = /\,\s*/;
    if(typeof posX == 'undefined')
      return commasp + pos;
    s1 = pos.split(s);
    s2 = posX.split(s);
    if(s1.length >= s2.length && s1[0].length >= s2[0].length) {
      l += pos;
    } else {
      s1 = [];
      s3 = posY.split(s);
      for(i = 0; i < s2.length; ++i) {
        s1.push(s2.shift() + ' ' + s3.shift());
      }
      l += (prev[bgpos] = s1.join(commasp));
    }
    return l;
  }

  function createGlow(rgb, a) {
    var ct = c.getContext('2d'), g = ct.createRadialGradient(r,r,0,r,r,r);
    g.addColorStop(0, 'rgba(' + rgb + commasp + a + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ct.fillStyle = g;
    ct.fillRect(0, 0, r * 2, r * 2);
    durl = 'url(' + c.toDataURL() + ')';
  }

  function moveTo(x,y) {
    SetProperty(i,bgpos, (x - r) + 'px ' + (y - r) + 'px' + list);
  }

  function followMouse(e,x,y,p) {
    if(i) {
      if(e.pageX) {
        p = $(this).offset(), x = e.pageX - p.left, y = e.pageY - p.top;
      } else {
        x = e.clientX, y = e.clientY;
      }
      moveTo(x, y);
    }
  }

  function yesMouse(e) {
    var t = e.target, bi = GetProperty(t,bgimage), a;
    list = '';
    if(bi) {
      for(a=0; a < propslen; ++a) {
        prev[props[a]] = GetProperty(t,props[a]);
      }
      list = getList(prev);
      SetProperty(t,bgrepeat,'no-repeat, ' + prev[bgrepeat]);
      SetProperty(t,bgimage,durl + commasp + bi);
      SetProperty(t,bgattach,'scroll, ' + prev[bgattach]);
    }
    i = t;
  }

  function noMouse(e) {
    for(var a=0; a < propslen; ++a) {
      SetProperty(i,props[a],prev[props[a]]);
    }
    i = null;
  }

  function glowspot(o) {
    c = document.createElement('canvas');
    if(!c || !c.getContext) return false;

    if(o) {
      for(var i in o)
        opts[i] = o[i];
    }

    r = opts.size;
    c.width = c.height = r * 2;
    createGlow(opts.colour, opts.intensity);
    this.each(function() {
      $(this).bind({
        mousemove:followMouse,
        mouseout:noMouse,
        mouseover:yesMouse
      });
    });
    return true;
  }

  jQuery.fn.glowspot = glowspot;
}(jQuery))
