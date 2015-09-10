/**
 *  Textile Language Definition
 */
(function($) {

var Textile = {

  'function-bold' :         {
                              search: /([^\n]+)([\n\s]*)/g,
                              replace: "*$1*$2"
                            },

  'function-italic' :       {
                              search: /([^\n]+)([\n\s]*)/g,
                              replace: "_$1_$2"
                            },

  /*
  'function-hr'     :       {
                              append: "\n<br/>\n"
                            },
  */

  'function-code'   :       {
                              search: /([^\n]+)([\n\s]*)/g,
                              replace: "@$1@$2"
                            },

  'function-ul'     :       {
                              search: /(.+)([\n]?)/gi,
                              replace: "* $1$2"
                            },

  'function-ol'   :         {
                              search: /(.+)([\n]?)/gi,
                              replace: "# $1$2"
                            },

  'function-blockquote' :   {
                              search: /(.+)([\n]?)/gi,
                              replace: "bq. $1$2"
                            },

  'function-h1'         :   {
                              search: /(.+)([\n]?)/g,
                              replace: "h1. $1$2"
                            },

  'function-h2'         :   {
                              search: /(.+)([\n]?)/g,
                              replace: "h2. $1$2"
                            },

  'function-h3'         :   {
                              search: /(.+)([\n]?)/g,
                              replace: "h3. $1$2"
                            },

  'function-link'       :   {
                              exec: function( txt, selText, $field, callback, selPos ) {
                                var results = null;
                                $.fn.dialog2.helpers.customPrompt({
                                  title: 'Insert Link',
                                  fields: [
                                    {
                                      id:   'text',
                                      name: 'Link Text',
                                      type: 'text',
                                      help: 'The text to display to the user.',
									  value: selText
                                    },
                                    {
                                      id:   'href',
                                      name: 'URL',
                                      type: 'text',
                                      help: 'The URL to link to.'
                                    }
                                  ],
                                  OK: function( res ) {
                                   var h = '';
								   var href = res['href'];
								   if (!href.match( /^(https?:|mailto:|\/|ftp:)/i )) {
								      if (href.match( /^[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i )) {
										href = 'mailto:'+href;
									  }
								      else {
										href = 'http://'+href;
									  }
								   }
                                   if ( res['text'] && res['href'] ) {
                                      h = '"' + res['text'] + '":' + href;
                                   }
								   callback($field, h, null, null, selPos);
                                  }
                                });


                              }
                            },

  'function-image'      :   {
                              exec: function( txt, selText, $field, callback, selPos ) {
                                var results = null;
                                $.fn.dialog2.helpers.customPrompt({
                                  title: 'Insert Image',
                                  fields: [
                                    {
                                      id: 'url',
                                      name: 'Image URL',
                                      type: 'text'
                                    },
                                    {
                                      id: 'alt',
                                      name: 'Alt Text',
                                      type: 'text'
                                    }
                                  ],
                                  OK: function( res ) {
                                    if ( res['url'] ) {
                                      var h = '!' + res['url'];
                                      if ( res['alt'] != '' ) {
                                        h += '(' + res['alt'] + ')';
                                      }
                                      h += '!';
                                      callback($field, h, null, null, selPos);
                                    }
                                  }
                                });
                              }
                            }

};

$.GollumEditor.LanguageDefinition._DEFS['textile'] = Textile;

var TextileHelp = [
  {
    menuName: 'Phrase Modifiers',
    content: [
                {
                  menuName: 'Emphasis / Strength',
                  data: '<p>To place emphasis or strength on inline text, simply place <code>_</code> (underscores) around the text for emphasis or <code>*</code> (asterisks) around the text for strength. In most browsers, <code>_mytext_</code> will appear as italics and <code>*mytext*</code> will appear as bold.</p><p>To force italics or bold, simply double the characters: <code>__mytext__</code> will appear italic and <code>**mytext**</code> will appear as bold text.</p>'
                },
                {
                  menuName: 'Citations / Editing',
                  data: '<p>To display citations, wrap your text in <code>??</code> (two question marks).</p><p>To display edit marks such as deleted text (strikethrough) or inserted text (underlined text), wrap your text in <code>-</code> (minuses) or <code>+</code> (pluses). For example <code>-mytext-</code> will be rendered as <span style="text-decoration: line-through;">mytext</span> and <code>+mytext+</code> will be rendered as <span style="text-decoration: underline;">mytext</span></p>'
                },
                {
                  menuName: 'Superscript / Subscript',
                  data: '<p>To display superscript, wrap your text in <code>^</code> (carets). To display subscript, wrap your text in <code>~</code> (tildes).</p>'
                },
                {
                  menuName: 'Code',
                  data: '<p>To display monospace code, wrap your text in <code>@</code> (at symbol). For example, <code>@mytext@</code> will appear as <code>mytext</code>.</p>'
                },
                {
                  menuName: 'Acronyms',
                  data: '<p>To create an acronym, suffix the acronym with the definition in parentheses. For example, <code>JS(JavaScript)</code> will be displayed as <abbr title="JavaScript">JS</abbr>.</p>'
                },
                {
                  menuName: 'Small Print',
                  data: '<p>To display small print wrap the text in <code>&lt;small&gt;&lt;/small&gt;</code> tags.</p><p>For example, <code>&lt;small&gt;Source: Massachusetts Institute of Technology.&lt;/small&gt;</code>.</p>'
                }
              ]
  },
  {
    menuName: 'Block Modifiers',
    content: [
                {
                  menuName: 'Headings',
                  data: '<p>To display a heading in Textile, prefix your line of text with <code>hn.</code>, where <code>n</code> equals the heading size you want (1 is largest, 6 is smallest).</p>'
                },
                {
                  menuName: 'Paragraphs / Quotes',
                  data: '<p>To create a new paragraph, prefix your first line of a block of text with <code>p.</code>.</p><p>To create a blockquote, make sure at least one blank line exists between your text and any surrounding text, and then prefix that block with <code>bq.</code> If you need to extend a blockquote to more than one text block, write <code>bq..</code> (note the two periods) and prefix your next normal paragraph with <code>p.</code></p>'
                },
                {
                  menuName: 'Code Blocks',
                  data: '<p>Code blocks in textile are simply prefixed like any other block. To create a code block, place the beginning of the block on a separate line and prefix it with <code>bc.</code></p><p>To display a preformatted block, prefix the block with <code>pre.</code></p>'
                },
                {
                  menuName: 'Lists',
                  data: '<p>To create ordered lists, prefix each line with <code>#</code>. To create unordered lists, prefix each line with <code>*</code>.</p><pre><code>You must have a blank line after any text that comes before your lists:\n\n# Order item 1\n# Order item 2\n\n* Unordered item 1\n* Unordered item 2\n\n… and a blank line afterwards if you have more text.</code></pre>'
                },
                {
                  menuName: 'Definition lists',
                  data: '<p>You may wish to define a list of related information, such as a venue address, and a venue time, whereby you have a definition title (venue address) and a definition value (e.g. the actual address).</p>'+
				        '<pre><code>h1. Event details\n\n; Venue address\n: The Meeting Rooms, 1 London road\n; Registration at\n: 8:30am – 9am</code</pre>'
                }
             ]
  },
  {
    menuName: 'Links / Images / Symbols',
    content: [
               {
                 menuName: 'Links',
                 data: '<p>To display a link, put the text you want to display in quotes, then a colon (<code>:</code>), then the URL after the colon. For example <code>&quot;GitHub&quot;:http://github.com/</code> will appear as <a href="javascript:void(0);">GitHub</a>.</p>'
               },
               {
                 menuName: 'Images',
                 data: '<p>To display an image, simply wrap the image&rsquo;s URL in <code>!</code> (exclamation points). If you want to link the image to a URL, you can blend the image and link syntax: place your image URL in the exclamation points and suffix that with a colon and your URL. For example, an image at <code>http://myurl/image.png</code> that should link to <code>http://myurl/</code> should be written as <code>!http://myurl/image.png!:http://myurl/</code>.</p>'
               },
               {
                 menuName: 'Symbols',
                 data: '<p>Some commonly used symbols can be hard to find on your keyboard, if present at all. You can use the following:</p><pre><code>Registered Trademark(R)\nTrademark(tm)\nCopyright (C) 2008\nOne quarter [1/4] symbol\nOne half [1/2] symbol\nThree quarters [3/4] symbol\nDegree [o] symbol\nPlus/minus [+/-] symbol</code></pre><p>Which gives us:</p><pre><kbd>Registered Trademark®\nTrademark™\nCopyright © 2008\nOne quarter ¼ symbol\nOne half ½ symbol\nThree quarters ¾ symbol\nDegree ° symbol\nPlus/minus ± symbol</kbd></pre>'
               }
             ]
  },
  {
    menuName: 'Tables',
    content: [
               {
                 menuName: 'Introduction',
                 data: '<p>Simple tables can be built by separating fields with the pipe <code>|</code> character.</p><pre><code>| name | age | sex |\n| joan | 24 | f |\n| archie | 29 | m |\n| bella | 45 | f |</code></pre>'
               },
               {
                 menuName: 'Table Headers',
                 data: '<p>For a table header, add <code>_.</code> after the pipe <code>|</code>.</p><pre><code>|_. name |_. age |_. sex |\n| joan | 24 | f |\n| archie | 29 | m |\n| bella | 45 | f |</code></pre>'
               },
               {
                 menuName: 'Cell Spanning',
                 data: '<p>Think of a spreadsheet. Sometimes you want a cell to span 2 or more rows, or 2 or more columns.</p><p>A backslash <code>\\</code> is used to span columns. For example </p><pre><code>|\\2. spans two cols |\n| col 1 | col 2 |</code></pre>'+
				 '<p>A forward slash <code>/</code> is used to span rows. For example </p><pre><code>|/3. spans 3 rows | row a |\n| row b |\n| row c |</code></pre>'
               },
               {
                 menuName: 'Cell Alignment',
                 data: '<p>You’re able to declare the aligning for reach cell in a tabe.</p><pre><code>|_. Alignment options|\n|<. Align left |\n|>. Align right|\n|=. Center |</code></pre>'
               }
             ]
  }
];

//$.GollumEditor.defineHelp('textile', TextileHelp);
$.GollumEditor.Help._DEFS['textile'] = TextileHelp;
})(jQuery);