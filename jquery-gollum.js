/**
 *  gollum.editor.js
 *  A jQuery plugin that creates the Gollum Editor.
 *
 *  Usage:
 *  $.GollumEditor(); on DOM ready.
 */
(function($) {

  // static constructs
	$.GollumEditor = $.GollumEditor || {};

	// Editor options
    $.GollumEditor.DefaultOptions = {
      MarkupType: 'markdown',
      EditorMode: 'code',
      HasFunctionBar: true,
      Debug: false,
      NoDefinitionsFor: []
    };

    $.GollumEditor.LanguageDefinition = {
      _DEFS: {}
    };
    $.GollumEditor.Help = {
      _DEFS: {}
    };

  /**
   *  $.GollumEditor
   *
   *  You don't need to do anything. Just run this on DOM ready.
   */
  function GollumEditor(container, ActiveOptions) {
    var $self = container, $textarea = $self.find('textarea'), _this=this, _id=$self.attr('id');

            /**
             *  debug
             *  Prints debug information to console.log if debug output is enabled.
             *
             *  @param  mixed  Whatever you want to dump to console.log
             *  @return void
             */
            var debug = function(m) {
              if ( ActiveOptions.Debug &&
                   typeof console != 'undefined' ) {
                console.log( m );
              }
            };



            /**
             *  LanguageDefinition
             *  Language definition file handler
             *  Loads language definition files as necessary.
             */
            var LanguageDefinition = {
                _ACTIVE_LANG: '',
                _LOADED_LANGS: [],
                _LANG: {},

              /**
               *  Defines a language
               *
               *  @param name string  The name of the language
               *  @param name object  The definition object
               */
              define: function( name, definitionObject ) {
                LanguageDefinition._ACTIVE_LANG = name;
                LanguageDefinition._LOADED_LANGS.push( name );
                if ( typeof $.GollumEditor.WikiLanguage == 'object' ) {
                  var definition = {};
                  $.extend(definition, $.GollumEditor.WikiLanguage, definitionObject);
                  LanguageDefinition._LANG[name] = definition;
                } else {
                  LanguageDefinition._LANG[name] = definitionObject;
                }
              },

              getActiveLanguage: function() {
                return LanguageDefinition._ACTIVE_LANG;
              },

              setActiveLanguage: function( name ) {
                LanguageDefinition.define(name, $.GollumEditor.LanguageDefinition._DEFS[name]);
                Help.define(name, $.GollumEditor.Help._DEFS[name]);
                if ( EditorHas.functionBar() ) {
                  FunctionBar.refresh();
                }

                if ( LanguageDefinition.isValid() && EditorHas.formatSelector() ) {
                  FormatSelector.updateSelected();
                }
              },


              /**
               *  gets a definition object for a specified attribute
               *
               *  @param  string  attr    The specified attribute.
               *  @param  string  specified_lang  The language to pull a definition for.
               *  @return object if exists, null otherwise
               */
              getDefinitionFor: function( attr, specified_lang ) {
                if ( !specified_lang ) {
                  specified_lang = LanguageDefinition._ACTIVE_LANG;
                }

                if ( LanguageDefinition.isLoadedFor(specified_lang) &&
                     LanguageDefinition._LANG[specified_lang][attr] &&
                     typeof LanguageDefinition._LANG[specified_lang][attr] == 'object' ) {
                  return LanguageDefinition._LANG[specified_lang][attr];
                }

                return null;
              },


              /**
               *  loadFor
               *  Asynchronously loads a definition file for the current markup.
               *  Definition files are necessary to use the code editor.
               *
               *  @param  string  markup_name  The markup name you want to load
               *  @return void
               */
              loadFor: function( markup_name, on_complete ) {
                // Keep us from hitting 404s on our site, check the definition blacklist
                if ( ActiveOptions.NoDefinitionsFor.length ) {
                  for ( var i=0; i < ActiveOptions.NoDefinitionsFor.length; i++ ) {
                    if ( markup_name == ActiveOptions.NoDefinitionsFor[i] ) {
                      // we don't have this. get out.
                      if ( typeof on_complete == 'function' ) {
                        on_complete( null, 'error' );
                        return;
                      }
                    }
                  }
                }

                // attempt to load the definition for this language
                var script_uri = '/_/js/editor/langs/' + markup_name + '.js';
                $.ajax({
                  url: script_uri,
                  dataType: 'script',
                  global: false,
                  cache: false,
                  complete: function( xhr, textStatus ) {
                    //$(this).GollumEditor().LanguageDefinition.setActiveLanguageCallback( xhr, textStatus );
                    /*
                    if ( typeof on_complete == 'function' ) {
                      on_complete( xhr, textStatus );
                    }
                    */
                  },
                  context: $self
                });
              },


              /**
               *  isLoadedFor
               *  Checks to see if a definition file has been loaded for the
               *  specified markup language.
               *
               *  @param  string  markup_name   The name of the markup.
               *  @return boolean
               */
              isLoadedFor: function( markup_name ) {
                if ( LanguageDefinition._LOADED_LANGS.length === 0 ) {
                  return false;
                }

                for ( var i=0; i < LanguageDefinition._LOADED_LANGS.length; i++ ) {
                  if ( LanguageDefinition._LOADED_LANGS[i] == markup_name ) {
                    return true;
                  }
                }
                return false;
              },

              isValid: function() {
                return ( LanguageDefinition._ACTIVE_LANG &&
                         typeof LanguageDefinition._LANG[LanguageDefinition._ACTIVE_LANG] ==
                         'object' );
              }

            };

            _this.LanguageDefinition = LanguageDefinition;




            /**
             *  EditorHas
             *  Various conditionals to check what features of the Gollum Editor are
             *  active/operational.
             */
            var EditorHas = {


              /**
               *  EditorHas.baseEditorMarkup
               *  True if the basic editor form is in place.
               *
               *  @return boolean
               */
              baseEditorMarkup: function() {
                return true;
              },


              /**
               *  EditorHas.collapsibleInputs
               *  True if the editor contains collapsible inputs for things like the
               *  sidebar or footer, false otherwise.
               *
               *  @return boolean
               */
              collapsibleInputs: function() {
                return false;
              },


              /**
               *  EditorHas.formatSelector
               *  True if the editor has a format selector (for switching between
               *  language types), false otherwise.
               *
               *  @return boolean
               */
              formatSelector: function() {
                return false;
              },


              /**
               *  EditorHas.functionBar
               *  True if the Function Bar markup exists.
               *
               *  @return boolean
               */
              functionBar: function() {
                return ( ActiveOptions.HasFunctionBar &&
                         $self.find('.gollum-editor-function-bar').length );
              },


              /**
               *  EditorHas.ff4Environment
               *  True if in a Firefox 4.0 Beta environment.
               *
               *  @return boolean
               */
              ff4Environment: function() {
                var ua = new RegExp(/Firefox\/4.0b/);
                return ( ua.test( navigator.userAgent ) );
              },


              /**
               *  EditorHas.editSummaryMarkup
               *  True if the editor has a summary field (Gollum's commit message),
               *  false otherwise.
               *
               *  @return boolean
               */
              editSummaryMarkup: function() {
                return false;
              },


              /**
               *  EditorHas.help
               *  True if the editor contains the inline help sector, false otherwise.
               *
               *  @return boolean
               */
              help: function() {
                return ( $self.find('.gollum-editor-help').length &&
                         $self.find('.gollum-editor .function-help').length );
              },


              /**
               *  EditorHas.previewButton
               *  True if the editor has a preview button, false otherwise.
               *
               *  @return boolean
               */
              previewButton: function() {
                return false;
              },


              /**
               *  EditorHas.titleDisplayed
               *  True if the editor is displaying a title field, false otherwise.
               *
               *  @return boolean
               */
              titleDisplayed: function() {
                return false;
              }

            };

            _this.EditorHas = EditorHas;


            /**
             *  FunctionBar
             *
             *  Things the function bar does.
             */
             var FunctionBar = {

                isActive: false,


                /**
                 *  FunctionBar.activate
                 *  Activates the function bar, attaching all click events
                 *  and displaying the bar.
                 *
                 */
                activate: function() {
                  debug('Activating function bar');
                  var t = _this;
                  var _id = _id;

                  // check these out
                  $self.find('.gollum-editor-function-bar a.function-button').each(function() {
                    var id = $(this).prop('className').split(' ')[0];
                    if ( LanguageDefinition.getDefinitionFor( id ) ) {

                      $(this).click(FunctionBar.evtFunctionButtonClick);
                      $(this).removeClass('disabled');
                    }
                    else if ( ! $(this).hasClass('function-help') ) {
                      $(this).addClass('disabled');
                    }
                  });

                  // show bar as active
                  $self.find('.gollum-editor-function-bar').addClass( 'active' );
                  FunctionBar.isActive = true;
                },


                deactivate: function() {
                  $self.find('.gollum-editor-function-bar a.function-button').unbind('click');
                  $self.find('.gollum-editor-function-bar').removeClass( 'active' );
                  FunctionBar.isActive = false;
                },


                /**
                 *  FunctionBar.evtFunctionButtonClick
                 *  Event handler for the function buttons. Traps the click and
                 *  executes the proper language action.
                 *
                 *  @param jQuery.Event jQuery event object.
                 */
                evtFunctionButtonClick: function(e) {
                  e.preventDefault();
                  var id = $(this).prop('className').split(' ')[0];
                  var def = LanguageDefinition.getDefinitionFor( id );
                  if ( typeof def == 'object' ) {
                    FunctionBar.executeAction( def );
                  }
                },


                /**
                 *  FunctionBar.executeAction
                 *  Executes a language-specific defined action for a function button.
                 *
                 */
                executeAction: function( definitionObject ) {
                  // get the selected text from the textarea
                  var txt = $textarea.val();
                  // hmm, I'm not sure this will work in a textarea
                  var selPos = FunctionBar
                                .getFieldSelectionPosition( $textarea );
                  var selText = FunctionBar.getFieldSelection( $textarea );
                  var repText = selText;
                  var reselect = true;
                  var cursor = null;

                  // execute a replacement function if one exists
                  if ( definitionObject.exec &&
                       typeof definitionObject.exec == 'function' ) {
					var selPos = FunctionBar.getFieldSelectionPosition( $textarea );
                    definitionObject.exec( txt, selText, $textarea, FunctionBar.replaceFieldSelection, selPos );
                    return;
                  }

                  // execute a search/replace if they exist
                  var searchExp = /([^\n]+)/gi;
                  if ( definitionObject.search &&
                       typeof definitionObject.search == 'object' ) {
                    debug('Replacing search Regex');
                    searchExp = null;
                    searchExp = new RegExp ( definitionObject.search );
                    debug( searchExp );
                  }
                  debug('repText is ' + '"' + repText + '"');
                  // replace text
                  if ( definitionObject.replace &&
                       typeof definitionObject.replace == 'string' ) {
                    debug('Running replacement - using ' + definitionObject.replace);
                    var rt = definitionObject.replace;
                    repText = repText.replace( searchExp, rt );
                    // remove backreferences
                    repText = repText.replace( /\$[\d]/g, '' );

                    if ( repText === '' ) {
                      debug('Search string is empty');

                      // find position of $1 - this is where we will place the cursor
                      cursor = rt.indexOf('$1');

                      // we have an empty string, so just remove backreferences
                      repText = rt.replace( /\$[\d]/g, '' );

                      // if the position of $1 doesn't exist, stick the cursor in
                      // the middle
                      if ( cursor == -1 ) {
                        cursor = Math.floor( rt.length / 2 );
                      }
                    }
                  }

                  // append if necessary
                  if ( definitionObject.append &&
                       typeof definitionObject.append == 'string' ) {
                    if ( repText == selText ) {
                      reselect = false;
                    }
                    repText += definitionObject.append;
                  }

                  if ( repText ) {
                    FunctionBar.replaceFieldSelection( $textarea,
                                                       repText, reselect, cursor );
                  }
                },


                /**
                 *  getFieldSelectionPosition
                 *  Retrieves the selection range for the textarea.
                 *
                 *  @return object the .start and .end offsets in the string
                 */
                getFieldSelectionPosition: function( $field ) {
				  var e = $field[0];

				  var retval = { text: "", start: 0, end: 0, length: 0 };
				  if (e.setSelectionRange) { // W3C/Gecko
					  retval.start= e.selectionStart;
					  retval.end = e.selectionEnd;
					  retval.text = (retval.start != retval.end) ? e.value.substring(retval.start, retval.end): "";
				  }
				  else if (document.selection) { // IE
					  if (e.tagName && e.tagName === "TEXTAREA") {
						  var $oS = document.selection.createRange().duplicate();
						  var $oR = e.createTextRange();
						  var $sB = $oS.getBookmark();
						  $oR.moveToBookmark($sB);
					  }
					  else {
						  var $oR = document.selection.createRange().duplicate();
					  }

					  retval.text = $oR.text;

					  for (; $oR.moveStart("character", -1) !== 0; retval.start++);
						  retval.end = retval.text.length + retval.start;
				  }
				  retval.length = retval.text.length;
				  return retval;
                },


                /**
                 *  getFieldSelection
                 *  Returns the currently selected substring of the textarea.
                 *
                 *  @param  jQuery  A jQuery object for the textarea.
                 *  @return string  Selected string.
                 */
                getFieldSelection: function( $field ) {
                  var selStr = '';
                  var selPos;

                  if ( $field.length ) {
                    selPos = FunctionBar.getFieldSelectionPosition( $field );
					return selPos.text; // new getFieldSelectionPosition return selection
                  }
                  return '';
                },


                isShown: function() {
                  return ($self.find('.gollum-editor-function-bar').is(':visible'));
                },

                refresh: function() {
                  if ( EditorHas.functionBar() ) {
                    debug('Refreshing function bar');
                    if ( LanguageDefinition.isValid() ) {
                      $self.find('.gollum-editor-function-bar a.function-button').unbind('click');
                      FunctionBar.activate();
                      if ( Help ) {
                        Help.setActiveHelp( LanguageDefinition.getActiveLanguage() );
                      }
                    } else {
                      debug('Language definition is invalid.');
                      if ( FunctionBar.isShown() ) {
                        // deactivate the function bar; it's not gonna work now
                        FunctionBar.deactivate();
                      }
                      if ( Help.isShown() ) {
                        Help.hide();
                      }
                    }
                  }
                },


                /**
                 *  replaceFieldSelection
                 *  Replaces the currently selected substring of the textarea with
                 *  a new string.
                 *
                 *  @param  jQuery  A jQuery object for the textarea.
                 *  @param  string  The string to replace the current selection with.
                 *  @param  boolean Reselect the new text range.
                 */
                replaceFieldSelection: function( $field, replaceText, reselect, cursorOffset, useStoredPos ) {
				  var selPos = useStoredPos || FunctionBar.getFieldSelectionPosition( $field );

                  var fullStr = $field.val();
                  var selectNew = true;
                  if ( reselect === false) {
                    selectNew = false;
                  }

				  var scrollTop = null;
                  if ( $field[0].scrollTop ) {
                    scrollTop = $field[0].scrollTop;
                  }

                  $field.val( fullStr.substring(0, selPos.start) + replaceText + fullStr.substring(selPos.end) );

                  $field[0].focus();

                  if ( selectNew ) {
                    if ( $field[0].setSelectionRange ) {
                      if ( cursorOffset ) {
                        $field[0].setSelectionRange(selPos.start + cursorOffset, selPos.start + cursorOffset);
                      } else {
                        $field[0].setSelectionRange( selPos.start, selPos.start + replaceText.length );
                      }
                    } else if ( $field[0].createTextRange ) {
                      var range = $field[0].createTextRange();
                      range.collapse( true );
                      if ( cursorOffset ) {
                        range.moveEnd( selPos.start + cursorOffset );
                        range.moveStart( selPos.start + cursorOffset );
                      } else {
                        range.moveEnd( 'character', selPos.start + replaceText.length );
                        range.moveStart( 'character', selPos.start );
                      }
                      range.select();
                    }
                  }

                  if ( scrollTop ) {
                    // this jumps sometimes in FF
                    $field[0].scrollTop = scrollTop;
                  }
                }
             };

             _this.FunctionBar = FunctionBar;



             /**
              *  FormatSelector
              *
              *  Functions relating to the format selector (if it exists)
              */
             var FormatSelector = {

               $_SELECTOR: null,

               /**
                *  FormatSelector.evtChangeFormat
                *  Event handler for when a format has been changed by the format
                *  selector. Will automatically load a new language definition
                *  via JS if necessary.
                *
                *  @return void
                */
               evtChangeFormat: function( e ) {
                 var newMarkup = $(this).val();
                 LanguageDefinition.setActiveLanguage( newMarkup );
               },


               /**
                *  FormatSelector.init
                *  Initializes the format selector.
                *
                *  @return void
                */
               init: function( $sel ) {
                 debug('Initializing format selector');

                 // unbind events if init is being called twice for some reason
                 if ( FormatSelector.$_SELECTOR &&
                      typeof FormatSelector.$_SELECTOR == 'object' ) {
                   FormatSelector.$_SELECTOR.unbind( 'change' );
                 }

                 FormatSelector.$_SELECTOR = $sel;

                 // set format selector to the current language
                 FormatSelector.updateSelected();
                 FormatSelector.$_SELECTOR.change( FormatSelector.evtChangeFormat );
               },


               /**
                * FormatSelector.update
                */
              updateSelected: function() {
                 var currentLang = LanguageDefinition.getActiveLanguage();
                 FormatSelector.$_SELECTOR.val( currentLang );
              }

             };

             _this.FormatSelector = FormatSelector;



             /**
              *  Help
              *
              *  Functions that manage the display and loading of inline help files.
              */
            var Help = {
              _ACTIVE_HELP: '',
              _LOADED_HELP_LANGS: [],
              _HELP: {},

              /**
               *  Help.define
               *
               *  Defines a new help context and enables the help function if it
               *  exists in the Gollum Function Bar.
               *
               *  @param string name   The name you're giving to this help context.
               *                       Generally, this should match the language name.
               *  @param object definitionObject The definition object being loaded from a
               *                                 language / help definition file.
               *  @return void
               */
              define: function( name, definitionObject ) {
                if ( Help.isValidHelpFormat( definitionObject ) ) {
                  debug('help is a valid format');

                  Help._ACTIVE_HELP_LANG = name;
                  Help._LOADED_HELP_LANGS.push( name );
                  Help._HELP[name] = definitionObject;

                  if ( $self.find(".function-help").length ) {
                    if ( $self.find('.function-help').hasClass('disabled') ) {
                      $self.find('.function-help').removeClass('disabled');
                    }
                    $self.find('.function-help').unbind('click');

                    $self.find('.function-help').click( Help.evtHelpButtonClick );

                    // generate help menus
                    Help.generateHelpMenuFor( name );

                    if ( $self.find('.gollum-editor-help').length &&
                         typeof $self.find('.gollum-editor-help').attr('data-autodisplay') !== 'undefined' &&
                         $self.find('.gollum-editor-help').attr('data-autodisplay') === 'true' ) {
                      Help.show();
                    }
                  }
                } else {
                  if ( $self.find('.function-help').length ) {
                    $self.find('.function-help').addClass('disabled');
                  }
                }
              },

              /**
               *  Help.generateHelpMenuFor
               *  Generates the markup for the main help menu given a context name.
               *
               *  @param string  name  The context name.
               *  @return void
               */
              generateHelpMenuFor: function( name ) {
                if ( !Help._HELP[name] ) {
                  debug('Help is not defined for ' + name.toString());
                  return false;
                }
                var helpData = Help._HELP[name];

                // clear this shiz out
                $self.find('.gollum-editor-help-parent').html('');
                $self.find('.gollum-editor-help-list').html('');
                $self.find('.gollum-editor-help-content').html('');

                // go go inefficient algorithm
                for ( var i=0; i < helpData.length; i++ ) {
                  if ( typeof helpData[i] != 'object' ) {
                    break;
                  }

                  var $newLi = $('<li><a href="#" rel="' + i + '">' +
                                 helpData[i].menuName + '</a></li>');
                  $self.find('.gollum-editor-help-parent').append( $newLi );
                  if ( i === 0 ) {
                    // select on first run
                    $newLi.children('a').addClass('selected');
                  }
                  $newLi.children('a').click( Help.evtParentMenuClick );
                }

                // generate parent submenu on first run
                Help.generateSubMenu( helpData[0], 0 );
                $($self.find('.gollum-editor-help-list li a').get(0)).click();

              },

              /**
               *  Help.generateSubMenu
               *  Generates the markup for the inline help sub-menu given the data
               *  object for the submenu and the array index to start at.
               *
               *  @param object subData The data for the sub-menu.
               *  @param integer index  The index clicked on (parent menu index).
               *  @return void
               */
              generateSubMenu: function( subData, index ) {
                $self.find('.gollum-editor-help-list').html('');
                $self.find('.gollum-editor-help-content').html('');
                for ( var i=0; i < subData.content.length; i++ ) {
                  if ( typeof subData.content[i] != 'object' ) {
                    break;
                  }

                  var $subLi = $('<li><a href="#" rel="' + index + ':' + i + '">' +
                                 subData.content[i].menuName + '</a></li>');


                  $self.find('.gollum-editor-help-list').append( $subLi );
                  $subLi.children('a').click( Help.evtSubMenuClick );
                }
              },

              hide: function() {
                if ( $.browser.msie ) {
                  $self.find('.gollum-editor-help').css('display', 'none');
                } else {
                  $self.find('.gollum-editor-help').animate({
                    opacity: 0
                  }, 200, function() {
                    $self.find('.gollum-editor-help')
                      .animate({ height: 'hide' }, 200);
                  });
                }
              },

              show: function() {
                if ( $.browser.msie ) {
                  // bypass effects for internet explorer, since it does weird crap
                  // to text antialiasing with opacity animations
                  $self.find('.gollum-editor-help').css('display', 'block');
                } else {
                  $self.find('.gollum-editor-help').animate({
                    height: 'show'
                  }, 200, function() {
                    $self.find('.gollum-editor-help')
                      .animate({ opacity: 1 }, 300);
                  });
                }
              },

              /**
               *  Help.showHelpFor
               *  Displays the actual help content given the two menu indexes, which are
               *  rendered in the rel="" attributes of the help menus
               *
               *  @param integer index1  parent index
               *  @param integer index2  submenu index
               *  @return void
               */
              showHelpFor: function( index1, index2 ) {
                var html =
                  Help._HELP[Help._ACTIVE_HELP_LANG][index1].content[index2].data;
                $self.find('.gollum-editor-help-content').html(html);
              },

              /**
               *  Help.isLoadedFor
               *  Returns true if help is loaded for a specific markup language,
               *  false otherwise.
               *
               *  @param string name   The name of the markup language.
               *  @return boolean
               */
              isLoadedFor: function( name ) {
                for ( var i=0; i < Help._LOADED_HELP_LANGS.length; i++ ) {
                  if ( name == Help._LOADED_HELP_LANGS[i] ) {
                    return true;
                  }
                }
                return false;
              },

              isShown: function() {
                return ($self.find('.gollum-editor-help').is(':visible'));
              },

              /**
               *  Help.isValidHelpFormat
               *  Does a quick check to make sure that the help definition isn't in a
               *  completely messed-up format.
               *
               *  @param object (Array) helpArr  The help definition array.
               *  @return boolean
               */
              isValidHelpFormat: function( helpArr ) {
                return ( typeof helpArr == 'object' &&
                         helpArr.length &&
                         typeof helpArr[0].menuName == 'string' &&
                         typeof helpArr[0].content == 'object' &&
                         helpArr[0].content.length );
              },

              /**
               *  Help.setActiveHelp
               *  Sets the active help definition to the one defined in the argument,
               *  re-rendering the help menu to match the new definition.
               *
               *  @param string  name  The name of the help definition.
               *  @return void
               */
              setActiveHelp: function( name ) {
                if ( !Help.isLoadedFor( name ) ) {
                  if ( $self.find('.function-help').length ) {
                    $self.find('.function-help').addClass('disabled');
                  }
                  if ( Help.isShown() ) {
                    Help.hide();
                  }
                } else {
                  Help._ACTIVE_HELP_LANG = name;
                  if ( $self.find(".function-help").length ) {
                    if ( $self.find('.function-help').hasClass('disabled') ) {
                      $self.find('.function-help').removeClass('disabled');
                    }
                    $self.find('.function-help').unbind('click');
                    $self.find('.function-help').click( Help.evtHelpButtonClick );
                    Help.generateHelpMenuFor( name );
                  }
                }
              },

              /**
               *  Help.evtHelpButtonClick
               *  Event handler for clicking the help button in the function bar.
               *
               *  @param jQuery.Event e  The jQuery event object.
               *  @return void
               */
              evtHelpButtonClick: function( e ) {
                e.preventDefault();

                if ( Help.isShown() ) {
                  // turn off autodisplay if it's on
                  if ( $self.find('.gollum-editor-help').length &&
                       $self.find('.gollum-editor-help').attr('data-autodisplay') !== 'undefined' &&
                       $self.find('.gollum-editor-help').attr('data-autodisplay') === 'true' ) {
                    $self.find('.gollum-editor-help').attr('data-autodisplay', '');
                  }
                  Help.hide(); }
                else { Help.show(); }
              },

              /**
               *  Help.evtParentMenuClick
               *  Event handler for clicking on an item in the parent menu. Automatically
               *  renders the submenu for the parent menu as well as the first result for
               *  the actual plain text.
               *
               *  @param jQuery.Event e  The jQuery event object.
               *  @return void
               */
              evtParentMenuClick: function( e ) {
                e.preventDefault();
                // short circuit if we've selected this already
                if ( $(this).hasClass('selected') ) { return; }

                // populate from help data for this
                var helpIndex = $(this).attr('rel');
                var subData = Help._HELP[Help._ACTIVE_HELP_LANG][helpIndex];

                $self.find('.gollum-editor-help-parent li a').removeClass('selected');
                $(this).addClass('selected');
                Help.generateSubMenu( subData, helpIndex );
                $($self.find('.gollum-editor-help-list li a').get(0)).click();
              },

              /**
               *  Help.evtSubMenuClick
               *  Event handler for clicking an item in a help submenu. Renders the
               *  appropriate text for the submenu link.
               *
               *  @param jQuery.Event e  The jQuery event object.
               *  @return void
               */
              evtSubMenuClick: function( e ) {
                e.preventDefault();
                if ( $(this).hasClass('selected') ) { return; }

                // split index rel data
                var rawIndex = $(this).attr('rel').split(':');
                $self.find('.gollum-editor-help-list li a').removeClass('selected');
                $(this).addClass('selected');
                Help.showHelpFor( rawIndex[0], rawIndex[1] );
              }
            };

            _this.Help = Help;









    debug('GollumEditor loading');


    if (typeof $.GollumEditor.replaceSelection == 'undefined') {
      $.GollumEditor.replaceSelection = function( repText ) {
        FunctionBar.replaceFieldSelection( $self.find('.gollum-editor-body'), repText );
      };
    }

    if ( EditorHas.baseEditorMarkup() ) {

      // Initialize the function bar by loading proper definitions
      if ( EditorHas.functionBar() ) {

        var htmlSetMarkupLang = $self.find('.gollum-editor-body').data('markupLang');

        if ( htmlSetMarkupLang ) {
          ActiveOptions.MarkupType = htmlSetMarkupLang;
        }

        // load language definition
        LanguageDefinition.setActiveLanguage( ActiveOptions.MarkupType );

        if ( EditorHas.help() ) {
          $self.find('.gollum-editor-help').hide();
          $self.find('.gollum-editor-help').removeClass('jaws');
        }

      }
      // EditorHas.functionBar
    }
    // EditorHas.baseEditorMarkup

  }


  // jQuery plugin implementation
  $.fn.GollumEditor = function(conf) {

      // return existing instance
      var el = this.eq(typeof conf == 'number' ? conf : 0).data("GollumEditor");
      if (el) { return el; }

      // setup options
      var globals = $.extend({}, $.GollumEditor.DefaultOptions), len = this.length;
      conf = $.extend(globals, conf);

      // init editor
      this.each(function(i) {
          var root = $(this);
          var textarea = root.find('textarea');

          if (textarea.data('markupLang')) {
              conf.MarkupType = textarea.data('markupLang');
          }

          el = new GollumEditor(root, conf);
          root.data("GollumEditor", el);
      });

      return conf.api ? el: this;
  };

})(jQuery);
