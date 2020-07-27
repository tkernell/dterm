function teal(message) {
  return "[[;#ED177A;]" + message + "]";
}

var App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  box: undefined,
  space: undefined,
  thread: undefined,
  spaceName: "dterm-dev",
  secretThread: "/orbitdb/zdpuAz9a9iUc3Y2PN98C1e2Tx5fFKk8S5gveu81aMGDEfWV5Q/3box.thread.dterm-dev.thread1",
  term: null,
  docs: {},
  echo: function(input) {
    App.term.echo(teal(input));
  },
  dir: "/",
  tempstore: "b",
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
          App.docs.helpdoc =
            "" +
            "\n" +
            "WELCOME TO THE TERMINAL COMMAND HELP DOC. \n" +
            "" +
            "\nCOMMANDS: \n" +
            "\taccount \t\t\tprint your ethereum account \n" +
            "\techo {string} \t\techos string to terminal \n" +
            "\tls \t\t\t\t\tlist your files \n" +
            "\ttouch {name text} \tsave new file on 3box \n" +
            "\tcat {name} \t\t\tprint file contents \n" +
            "\thelp \t\t\t\tget some info\n" +
            "\n" +
            "3BOX COMMANDS: \n" +
            "\tcreateThread {name} \tcreate private 3box thread" +
            "";

          App.echo(App.docs.helpdoc);
        },
        echo: function(input) {
          this.echo(teal(input));
        },
        account: function() {
          this.echo(App.account);
        },
        save: function(input) {
          App.tempstore = input;
        },
        read: function() {
          this.echo(App.tempstore);
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
          // App.space.thread.create
          App.echo("Creating thread...");
          App.space.createConfidentialThread(name).then(function(thread) {
            App.echo("Thread created.");
            App.thread = thread;
          });
        },
        addThreadMember: function(id) {
          App.echo("Adding member...")
          App.thread.addMember(id).then(function() {
            App.echo("Added " + id);
          })
        },
        joinThread: function(threadAddress) {
          App.echo("Joining thread...");
          App.space.joinThreadByAddress(threadAddress).then(function(thread) {
            App.thread = thread;
            App.echo("Joined thread");
          })
        },
        joinThread2: function() {
          App.echo("Joining thread...");
          App.space.joinThreadByAddress("/orbitdb/zdpuAz9a9iUc3Y2PN98C1e2Tx5fFKk8S5gveu81aMGDEfWV5Q/3box.thread.dterm-dev.thread1").then(function(thread) {
            App.thread = thread;
            App.echo("Joined thread");
          })
        },
        getThreadAddress: function() {
          App.echo(App.thread.address);
        },
        threadPosts: function() {
          App.thread.getPosts().then(function(posts) {
            App.echo(posts);
          })
        },
        post: function(message) {
          App.thread.post(message);
        },
        listen: function() {
          App.thread.onUpdate(function() {
            App.thread.getPosts({ limit:1 }).then(function(post) {
              console.log(post[0].message);
              App.echo(post[0].message);
            })
          })
        },
        
        // Not for production
        createThread2: function(name) {
          App.space.joinThread(name).then(function(thread) {
            App.thread = thread;
          })
        },
        joinMainThread: function() {
          App.echo("Joining main thread...");
          App.space.joinThreadByAddress("/orbitdb/zdpuAtouX4XQHmh4G61mEBouwahK8LsLetLKcsP5FpejYtUcE/3box.thread.dterm-dev.monkey").then(function(thread) {
            App.thread = thread;
            
          })
        },
        
        
        image: function(width, height) {
          const img = $(
            '<img src="https://placekitten.com/' + width + "/" + height + '">'
          );
          img.on("load", this.resume);
          this.pause();
          this.echo(img);
        }
      },
      {
        greetings: teal("Welcome to the panda Portal! \n" + ""),
        completion: true
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
    ethereum.enable().then(function() {
      console.log("Ethereum enabled");
      App.account = window.ethereum.selectedAddress;
      console.log("In initEth: " + App.account);
      App.echo("Detected account: " + App.account);
      return App.initBox();
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
        // return App.runOnce();
      });
    });
  }
};

$(function() {
  App.init();
});

const welcomeMessage = "" + "Welcome the the Minion Portal\n" + "";
