/*
| -------------------------------------------------------------------
|  MTGNode Playground Battlefield Module
| -------------------------------------------------------------------
|
|
| Author : Yomguithereal
| Version : 1.0
*/

;(function($, w, undefined){
  'use strict';

  // Deck Module
  //=============
  function BattlefieldModule(_side) {
    domino.module.call(this);
    var _this = this;

    var _area = Helpers.getArea(_side),
        _cardSelector = Helpers.getCardSelectorFunc(_side),
        _template = new CardTemplate(_side);

    // Selectors
    var $game_area = $('.game-area'),
        $battlefield = $('.game-emplacement'),
        $menu = $('#battlefield_context_menu');

    // Properties
    //------------
    this.height = $game_area.height();
    this.cards = '.card-min.in-game.'+_side;

    // Emettor
    //---------
    if (_side === 'my') {

      // Dropping card in game
      $battlefield.droppable({
        tolerance: 'intersect',
        drop: function(e, ui) {
          var $card = $(ui.draggable);

          // Interactions
          var interactions = [
            {
              class: 'in-graveyard',
              event: 'myResurrectCard'
            },
            {
              class: 'in-hand',
              event: 'myPlayCard'
            }
          ];

          for (var i = 0; i < interactions.length; i++) {
            if ($card.hasClass(interactions[i].class)) {
              _this.dispatchEvent(interactions[i].event, {
                id: +$card.attr('number')
              });

              break;
            }
          }
        }
      });

      // Tapping a card
      $game_area.on('click', this.cards, function() {
        $(this).toggleClass('tapped');
        _this.dispatchEvent('sendRealtimeMessage', {
          head: 'opTappedCard',
          body: {
            id: +$(this).attr('number')
          }
        })
      });

      // Contextual Menu
      $menu.contextualize({
        selector: '.game-emplacement.'+_area,
        callback: function(a) {
          console.log(a);
        }
      });
    }

    // Receptor
    //----------

    // Opponent dragged a card
    this.triggers.events[_side+'CardDragged'] = function(d, e) {
      var $card = _cardSelector(e.data.id);

      $card.css({
        top: _this.height - e.data.top - $card.height(),
        left: e.data.left,
        'z-index': e.data.zindex
      });
    }

    // Card Played
    this.triggers.events[_side+'PlayCard'] = function(d, e) {
      var $card = _cardSelector(e.data.id);

      $card.removeClass('in-hand');
      $card.addClass('in-game');

      if (_side === 'op') {
        $card.removeClass('flipped');
      }

      _this.dispatchEvent(_side+'ReorganizeHand');
    }

    // Card Tapped
    this.triggers.events[_side+'TappedCard'] = function(d, e) {
      var $card = _cardSelector(e.data.id);
      $card.toggleClass('tapped');
    }

    // Card Resurrected
    this.triggers.events[_side+'ResurrectCard'] = function(d, e) {
      var $card = _cardSelector(e.data.id);
      $card.removeClass('in-graveyard');
      $card.addClass('in-game');
    }
  }


  // Deck Hacks
  //============
  var _hacks = [];
  _hacks = _hacks
    .concat(Helpers.fromToHacks(
      'Hand',
      'Battlefield',
      'PlayCard'
    ))
    .concat(Helpers.fromToHacks(
      'Graveyard',
      'Battlefield',
      'ResurrectCard'
    ));

  // Exporting
  //===========
  window.BattlefieldModule = BattlefieldModule;
  window.battlefieldHacks = _hacks;
})(jQuery, window);
