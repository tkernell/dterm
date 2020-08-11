// !! This project is under development
var count = 0;

var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  thread: undefined,       // 
  settingsThread: undefined,
  settings: {},
  spaceName: "dterm-dev",
  term: null,
  docs: {},
  dictionary: [],  // 
  echo: function(input) {
    App.term.echo(input);
  },
  dir: "/",
  tempstore: "b",
  // Not in use
  tempStore: {
    name: "john",
    uncle: "bill",
    age: 29,
    last: "smith",
    full: function() {
      return this.name + " " + this.last;
    }
  },

  init: function() {
    return App.initTerminal();
  },

  // ******************************** //
  //                                  //
  //   Define DTERM functions here    //
  //                                  //
  // ******************************** //
  initTerminal: function() {
    $("body").terminal(
      {
        help: function() {
          $.get("./docs/helpdoc.txt").then(function(helpdoc) {
            App.echo(helpdoc);
          });
        },
        echo: function(input) {
          this.echo(color(input));
        },
        // echo: function(string) {
        //   return new Promise(function(resolve) {
        //     App.term.echo(string);
        //     setTimeout(resolve, 1000);
        //   });
        // },
        // read: function() {
        //   return App.term.read('').then(function(string) {
        //     App.term.echo('read[' +(++count)+']: ' + string);
        //   });
        // },
        account: function() {
          this.echo(App.account);
        },
        // Save some text to a local variable tempstore
        copytext: function(input) {
          App.tempstore = input;
        },
        learn: function() {
          $.get("./docs/learn.txt").then(function(learndoc) {
            App.echo(learndoc);
          });
        },
        // Echo tempstore text
        pastetext: function() {
          this.echo(App.tempstore);
        },
        box: function() {
          App.initBox();
        },
        less: function(url) {
          $.get(url).then(text => {
            this.less(text);
          });
        },

        // 3BOX STORAGE FUNCTIONS
        ls: function() {
          App.space.private.all().then(function(files) {
            App.echo(Object.keys(files).join("  "));
          });
        },
        cat: function(filename) {
          App.space.private.get(filename).then(function(content) {
            App.echo(content);
          });
        },
        touch: function(filename, content) {
          App.space.private.set(filename, content).then(function() {
            App.echo(filename + " saved to private space");
          });
        },

        // 3BOX THREADS
        createThread: function(name) {
          App.echo("Creating thread...");
          App.space.createConfidentialThread(name).then(function(thread) {
            App.echo("Thread created.");
            App.thread = thread;
          });
        },
        addThreadMember: function(id) {
          App.echo("Adding member...");
          App.thread.addMember(id).then(function() {
            App.echo("Added " + id);
          });
        },
        joinThread: function(threadAddress) {
          App.echo("Joining thread...");
          App.space.joinThreadByAddress(threadAddress).then(function(thread) {
            App.thread = thread;
            App.term.exec("listen");
            App.echo("Joined thread & listening");
          });
        },
        joinThread2: function() {
          App.echo("Joining thread...");
          App.space
            .joinThreadByAddress(
              "/orbitdb/zdpuAz9a9iUc3Y2PN98C1e2Tx5fFKk8S5gveu81aMGDEfWV5Q/3box.thread.dterm-dev.thread1"
            )
            .then(function(thread) {
              App.thread = thread;
              App.echo("Joined thread");
            });
        },
        getThreadAddress: function() {
          App.echo(App.thread.address);
        },
        threadPosts: function() {
          App.thread.getPosts().then(function(posts) {
            App.echo(posts);
          });
        },
        post: function(message) {
          App.thread.post(message);
        },
        listen: function() {
          // Make sure username dictionary is loaded
          App.loadDictionary();

          App.thread.onUpdate(function() {
            App.thread.getPosts({ limit: 1 }).then(function(post) {
              const post0 = post[0];
              console.log(post0.message);
              App.echo(
                color(getUsername(post0.author, App.dictionary) + ":: ") +
                  post0.message
              );
            });
          });
        },   
        mute: function() {    // mute doesn't work
          App.thread.onUpdate(function() {    
          })
        },
        makeDefaultThread: function() {
          App.settings.defaultThread = App.thread.address;
          App.settingsThread.post(App.settings).then(function() {
            App.term.echo('Settings saved!');
          })
        },
        createThread2: function(name) {
          App.space.joinThread(name).then(function(thread) {
            App.thread = thread;
          });
        },
        joinMainThread: function() {
          App.echo("Joining main thread...");
          App.space
            .joinThreadByAddress(
              "/orbitdb/zdpuAtouX4XQHmh4G61mEBouwahK8LsLetLKcsP5FpejYtUcE/3box.thread.dterm-dev.monkey"
            )
            .then(function(thread) {
              App.thread = thread;
              App.term.exec("listen");
              App.echo("Joined thread and listening");
            });
        },

        // **  WEB3  ** //
        web3utils: function(option, value) {
          this.echo(web3.utils[option](value));
        },
        addContract: function(_name, _address, _abiName) {
          if (Object.keys(App.settings.contracts).includes(_name)) {
            App.term.echo("Contract with this name already exists. Try another name.");
          } else if (App.settings.abis[_abiName] == undefined) {
            App.term.echo("No abi with this name exists. \nPlease either add abi with 'addAbi {name abi}' or choose a different name.");
          } else {
            App.settings.contracts[_name] = {
              address: _address,
              category: _abiName,
              contract: new web3.eth.Contract(JSON.parse(App.settings.abis[_abiName]))
            }
            App.settings.contracts[_name].contract.options.address = _address;
            App.settingsThread.post(App.settings).then(function() {
              App.echo("Contract added");
            });
          }
        },
        myContracts: function() {
          App.term.echo(Object.keys(App.settings.contracts));
        },
        myAbis: function() {
          App.term.echo(Object.keys(App.settings.abis).join('\n'));
        },
        contractMethods: function(name) {
          this.echo(Object.keys(App.settings.contracts[name].contract.methods).join('\n'))
        },
        addAbi: function(_name, _abi) {
          if (App.settings.abis[_name] !== undefined) {
            this.echo("abi with name " + _name + " already exists. Please choose different name.");
          } else {
            App.settings.abis[_name] = _abi;
            App.settingsThread.post(App.settings).then(function() {
              App.echo("abi added");
            })
          }
        },
        
      
        // Experimental
        html: function() {
          const link = $('<a href="google.com">Google</a>');
          App.echo(link);
          // this.echo(link);
        },
        download: function(url) {
          const link = $("<a href='" + url + "' download='file'>DOWNLOAD</a>");
          this.echo(link);
        },
        getdoc: function(url) {
          this.pause();
          $.get(url, function(txt) {
            App.echo(txt);
            App.term.resume();
          });
        },
        name: function(name) {
          this.read("last name: ", last_name => {
            this.echo("Your name is " + name + " " + last_name);
          });
        },
        image: function(width, height) {
          const img = $(
            '<img src="https://placekitten.com/' + width + "/" + height + '">'
          );
          img.on("load", this.resume);
          this.pause();
          this.echo(img);
          const img2 = $(
            "<img src='https://i0.wp.com/media.giphy.com/media/2si2ObWL19ZR9EFVX2/giphy.gif?w=708&ssl=1'>"
          );
          img2.on("load", this.resume);
          this.pause();
          this.echo(img2);
        },
        objectkeys: function(object) {  // View App.object names
          
          this.echo(Object.keys(App[object]).join("  "));
        },

        // Used for creating interactive menus from text files
        // in the form of 'clickableText..........Description'
        // The clickableText MUST be an internal terminal function
        click_function: function(func_name, description) {
          const func_call = func_name;
          var docline = $("<div class='menu_line'></div>");
          var func_span = $("<span class='clickme'></span>").text(func_call);
          func_span.click(function() {
            App.term.echo(func_call);
            App.term.exec(func_call);
          });
          var whitespace = ".".repeat(15 - func_name.length);
          var whitespace_span = $("<span></span>").text(whitespace);
          var descr_span = $("<span></span>").text(description);
          docline.append(func_span, whitespace_span, descr_span);

          this.echo(docline);
        },
        menu: function() {
          // this.pause();
          $.get("./docs/menu.txt", function(doc) {
            App.term.echo(doc);
            // App.term.resume();
          });
        }
      },
      {
        greetings: color(welcomeMessage),
        completion: true,
        // pipe: true
      }
    );
    App.term = $("body").terminal();

    return App.initWeb3();
  },

  initWeb3: function() {
    App.echo("Detecting web3...");
    if (typeof web3 !== "undefined") {
      console.log("Using web3 detected from external source like Metamask");
      App.term.echo("Using web3 detected from external source like Metamask");
      App.web3Provider = web3.givenProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log("Using localhost");
      App.term.echo("Using localhost");
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    return App.initEth();
  },

  initEth: function() {
    App.echo("Initializing ethereum account...");
    ethereum.request({ method: 'eth_requestAccounts' }).then(function() {
    // ethereum.enable().then(function() {
      console.log("Ethereum enabled");
      App.account = window.ethereum.selectedAddress;
      console.log("In initEth: " + App.account);
      App.echo("Detected account: " + App.account);

      if (App.account !== "0x0") {
        return App.initBox();
      }
      // return App.initBox();
    });
  },

  initBox: function() {
    App.echo("Opening box...");
    console.log("Opening box...");
    console.log("In initBox: " + App.account);
    Box.openBox(App.account, window.ethereum).then(function(box) {
      box.syncDone.then(function() {
        console.log(box);
        App.box = box;
        App.echo("Box opened!");
        return App.initSpace();
      });
    });
  },

  initSpace: function() {
    console.log("Opening space...");
    App.echo("Opening space...");
    App.box.openSpace(App.spaceName).then(function(space) {
      console.log("Space syncing...");
      App.echo("Space syncing...");
      space.syncDone.then(function() {
        console.log(space);
        // App.echo(space);
        App.echo("Space synced!");
        App.space = space;
        return App.initSettings();
      });
    });
  },
  
  // Initialize user settings. These are stored in a personal
  // confidential thread
  initSettings: function() {
    App.term.echo("Initializing user settings...");
    // Check whether dterm settings thread address exists,
    // This isn't storage isn't needed. Just check space.subscribedThreads()
    // SUBSCRIBEDTHREADS MAKES SOME THINGS MUCH SIMPLER FOR SOME USER DATA!!
    App.space.private.get('_dtermsettingsthread').then(function(addr) {
      if (addr == null) {
        App.term.echo("No settings yet. Generating settings data...");
        // If settings thread does not exist, create it
        App.space.createConfidentialThread('_dtermsettings').then(function(settingsThread) {
          // Save the thread address to storage for future retrieval
          App.space.private.set('_dtermsettingsthread', settingsThread.address).then(function() {
            App.settingsThread = settingsThread;
            App.settings = {
              defaultThread: '/orbitdb/zdpuAtouX4XQHmh4G61mEBouwahK8LsLetLKcsP5FpejYtUcE/3box.thread.dterm-dev.monkey',
              contactList: undefined,
              listen: true,
              inbox: undefined,
              contracts: {},
              abis: {}
            };
            App.settingsThread.post(App.settings).then(function() {
              return App._initSettings();
            })
          })
        })
      } else {
        console.log("Joining settings thread...");
        App.space.joinThreadByAddress(addr).then(function(settingsThread) {
          console.log("Joined settings thread");
          App.settingsThread = settingsThread;
          App.settingsThread.getPosts().then(function(posts) {
            console.log("Got settings thread posts");
            App.settings = posts[posts.length - 1].message;
            return App._initSettings();
          })
          
        })
        
      } 
    })
  },
  
  _initSettings: function() {
    console.log("In _initSettings");
    App.space.joinThreadByAddress(App.settings.defaultThread).then(function(thread) {
      App.thread = thread;
      if (App.settings.listen) {
        App.term.exec('listen');
      }
    })
    return App.initExperiment();
  },
  
  // Initializing contracts explicitly
  initExperiment: function() {
    App.settings.contracts = {
      'minionAvalanche': {
        address: '0x7A98a55A1300B52c126B0e011C780197bb468033',  // KOVAN
        category: 'minion',
        contract: {}
      },
      'avalanche': {
        address: '0x0190b395672ece097def4c64691099d810d84ea8',  // KOVAN
        category: 'moloch_v2',
        contract: {}
      },
      'simpleStorage': {
        address: '0xc9CdB7d8196fB9994c83b7740D7297462942993f',  // KOVAN
        category: {},
        contract: {}
      },
      'minionPublicResolver': {
        address: '0x13f01E79a6B96bbbFeDf50aaffb0EFC5B2D3C0bE', // ROPSTEN
        category: 'minionPublicResolver',
        contract: {}
      }
    }
    $.get("./docs/abi/minion.json").then(function(minion_abi) {
      $.get("./docs/abi/moloch_v2.txt").then(function(moloch_abi_string) {
        const moloch_abi = JSON.parse(moloch_abi_string);
        App.settings.contracts.minionAvalanche.contract = new web3.eth.Contract(minion_abi);
        App.settings.contracts.minionAvalanche.contract.options.address = App.settings.contracts.minionAvalanche.address;
    
        App.settings.contracts.avalanche.contract = new web3.eth.Contract(moloch_abi);
        App.settings.contracts.avalanche.contract.options.address = App.settings.contracts.avalanche.address;
        
      })
    })
    $.get("./docs/abi/simpleStorage.json").then(function(abi) {
      App.settings.contracts.simpleStorage.contract = new web3.eth.Contract(abi);
      App.settings.contracts.simpleStorage.contract.options.address = App.settings.contracts.simpleStorage.address;
    })
  },
  
  initAdditional: function() {
    App.term.exec("joinMainThread");
  },

  loadDictionary: function() {
    $.get("./docs/words.txt").then(function(dictionary) {
      App.dictionary = dictionary.split("\n");
    });
  }
};

$(function() {
  App.init();
});

const welcomeMessage =
  "" + "this is dterm\n" + "your portal to the decentralized web" + "\n\ntype 'help' for some options";

function getUsername(id, words) {
  const substrLength = 6;
  const n1 =
    web3.utils.hexToNumber(web3.utils.sha3(id).substr(0, substrLength)) %
    words.length;
  const n2 =
    web3.utils.hexToNumber(
      "0x" +
        web3.utils
          .sha3(id)
          .substr(substrLength + 1, substrLength + substrLength - 2)
    ) % words.length;

  console.log(words[n1] + "-" + words[n2]);
  return words[n1] + "-" + words[n2];
}

function color(message) {
  return "[[g;#ED177A;]" + message + "]";
};
function colorUserMessage(message) {
  return "[[;;]" + message + "]";
};

