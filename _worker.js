import { connect } from 'cloudflare:sockets';
const bugku = 'img.email1.vidio.com';
let expired = "2024-12-31"; // Format: YYYY-MM-DD
let userID = "3c426ba6-1c10-4d9c-b8a5-39e0b4d9cf86";
const listProxy = [
    { path: '/ae', proxy: '129.151.148.35' },
    { path: '/am', proxy: '213.159.76.60' },
    { path: '/be', proxy: '95.164.62.196' },
    { path: '/bg', proxy: '195.123.230.40' },
    { path: '/br', proxy: '144.22.252.124' },
    { path: '/ca', proxy: '172.98.207.58' },
    { path: '/ch', proxy: '94.247.42.207' },
    { path: '/cn', proxy: '120.26.61.84' },
    { path: '/de', proxy: '64.226.114.20' },
    { path: '/dk', proxy: '45.136.70.204' },
    { path: '/ee', proxy: '95.164.8.31' },
    { path: '/es', proxy: '34.175.202.195' },
    { path: '/fi', proxy: '45.138.73.83' },
    { path: '/fr', proxy: '136.244.118.247' },
    { path: '/gb', proxy: '161.35.42.34' },
    { path: '/hu', proxy: '46.183.186.57' },
    { path: '/id', proxy: '35.219.15.90' },
    { path: '/ie', proxy: '95.164.44.192' },
    { path: '/il', proxy: '129.159.130.38' },
    { path: '/in', proxy: '35.200.238.235' },
    { path: '/ir', proxy: '95.81.85.185' },
    { path: '/it', proxy: '188.213.168.52' },
    { path: '/jp', proxy: '45.12.134.207' },
    { path: '/kr', proxy: '129.154.50.159' },
    { path: '/kz', proxy: '45.80.208.39' },
    { path: '/lt', proxy: '103.113.69.99' },
    { path: '/lv', proxy: '45.142.215.189' },
    { path: '/md', proxy: '45.84.0.78' },
    { path: '/mx', proxy: '216.238.71.107' },
    { path: '/my', proxy: '166.88.35.141' },
    { path: '/nl', proxy: '188.166.78.56' },
    { path: '/nz', proxy: '119.224.58.125' },
    { path: '/pl', proxy: '91.239.148.53' },
    { path: '/ru', proxy: '92.223.65.183' },
    { path: '/sa', proxy: '95.177.171.7' },
    { path: '/se', proxy: '65.20.115.49' },
    { path: '/sg', proxy: '143.198.213.197' },
    { path: '/tr', proxy: '195.16.74.98' },
    { path: '/tw', proxy: '210.79.155.242' },
    { path: '/ua', proxy: '194.38.20.78' },
    { path: '/us', proxy: '34.83.245.149' },
    { path: '/vn', proxy: '103.82.26.183' }
];
let proxyIP;
export default {
    async fetch(request, ctx) {
      try {
        proxyIP = proxyIP;
        const url = new URL(request.url);
        const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader && !url.pathname.endsWith("/tandes")) {
	    return Response.redirect("https://google.com", 302);
	}
        for (const entry of listProxy) {
          if (url.pathname === entry.path) {
            proxyIP = entry.proxy;
            break;
          }
        }
        if (upgradeHeader === 'websocket' && proxyIP) {
          return await vlessOverWSHandler(request);
        }
        const allConfig = await getAllConfigVless(request.headers.get('Host'));
        return new Response(allConfig, {
          status: 200,
          headers: { "Content-Type": "text/html;charset=utf-8" },
        });
      } catch (err) {
        return new Response(err.toString(), { status: 500 });
      }
    },
  };
async function getAllConfigVless(hostName) {
    try {
        let vlessConfigs = '';
        let clashConfigs = '';
        for (const entry of listProxy) {
            const { path, proxy } = entry;
            const response = await fetch(`http://ip-api.com/json/${proxy}`);
            const data = await response.json();
	    function countryCodeToFlagEmoji(countryCode) {
                return countryCode
                    ? String.fromCodePoint(...[...countryCode.toUpperCase()].map(char => char.charCodeAt() + 0x1F1A5))
                    : "🏳️"; // Mengembalikan bendera netral jika countryCode kosong atau undefined
            }
	    const flagEmoji = countryCodeToFlagEmoji(data.countryCode);
            const pathFixed = encodeURIComponent(path);
            const vlessTls = `vless://${generateUUIDv4()}\u0040${bugku}:443?encryption=none&security=tls&sni=${hostName}&type=ws&host=${hostName}&path=${pathFixed}#${data.isp}, ${data.country} ${flagEmoji}`;
            const vlessNtls = `vless://${generateUUIDv4()}\u0040${bugku}80?path=${pathFixed}&security=none&encryption=none&host=${hostName}&type=ws&sni=${hostName}#${data.isp}, ${data.country} ${flagEmoji}`;
            const vlessTlsFixed = vlessTls.replace(/ /g, '%20');
            const vlessNtlsFixed = vlessNtls.replace(/ /g, '%20');
            const clashConfTls = 
`- name: ${data.isp} ${data.country} ${flagEmoji}
  server: ${bugku}
  port: 443
  type: vless
  uuid: ${generateUUIDv4()}
  cipher: auto
  tls: true
  skip-cert-verify: true
  network: ws
  servername: ${hostName}
  ws-opts:
    path: ${path}
    headers:
      Host: ${hostName}
  udp: true`;
             const clashConfNtls =
`- name: ${data.isp} ${data.country} ${flagEmoji}
  server: ${bugku}
  port: 80
  type: vless
  uuid: ${generateUUIDv4()}
  cipher: auto
  tls: false
  skip-cert-verify: true
  network: ws
  ws-opts:
    path: ${path}
    headers:
      Host: ${hostName}
  udp: true`;
            clashConfigs += `
<div style="display: none;">
   <textarea id="clashTls${path}">${clashConfTls}</textarea>
 </div>
<div style="display: none;">
   <textarea id="clashNtls${path}">${clashConfNtls}</textarea>
 </div>
<div class="config-section" style="background-color: rgba(10, 10, 10, 0.8); color: #00ff00; border: 2px solid #00ff00;">
    <p style="color: #00ff00;"><strong>ISP:</strong> ${data.isp} ${data.country} ${flagEmoji}</p>
    <hr style="border-color: #00ff00; width: 100%; margin-left: auto; margin-right: auto;" />
    <div class="config-toggle">
        <button class="button" onclick="toggleConfig(this, 'Tap Here To Show Configurations', 'Tap Here To Hide')">Tap Here To Show Configurations</button>
        <div class="config-content">
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">TLS:</h3>
                <p class="config">${clashConfTls}</p>
                <button class="button" onclick='copyClash("clashTls${path}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
            <hr style="border-color: #00ff00; width: 75%; margin-left: auto; margin-right: auto;" />
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">NTLS:</h3>
                <p class="config">${clashConfNtls}</p>
                <button class="button" onclick='copyClash("clashNtls${path}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
        </div>
    </div>
</div>
<hr class="config-divider" style="background: linear-gradient(to right, transparent, #00ff00, transparent); margin: 40px 0;" />
`;

vlessConfigs += `
<div class="config-section" style="background-color: rgba(10, 10, 10, 0.8); color: #00ff00; border: 2px solid #00ff00;">
    <p style="color: #00ff00;"><strong>ISP:</strong> ${data.isp} ${data.country} ${flagEmoji}</p>
    <hr style="border-color: #00ff00; width: 100%; margin-left: auto; margin-right: auto;" />
    <div class="config-toggle">
        <button class="button" onclick="toggleConfig(this, 'Tap Here To Show Account', 'Tap Here To Hide')">Tap Here To Show Account</button>
        <div class="config-content">
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">TLS:</h3>
                <p class="config" style="color: #00ff00;">${vlessTlsFixed}</p>
                <button class="button" onclick='copyToClipboard("${vlessTlsFixed}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
            <hr style="border-color: #00ff00; width: 75%; margin-left: auto; margin-right: auto;" />
            <div class="config-block" style="background-color: rgba(0, 0, 0, 0.3);">
                <h3 style="color: #00ff00;">NTLS:</h3>
                <p class="config" style="color: #00ff00;">${vlessNtlsFixed}</p>
                <button class="button" onclick='copyToClipboard("${vlessNtlsFixed}")'><i class="fa fa-clipboard"></i>Copy</button>
            </div>
        </div>
    </div>
</div>
<hr class="config-divider" style="background: linear-gradient(to right, transparent, #00ff00, transparent); margin: 40px 0;" />
`;
}
        const htmlConfigs = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLOUDFLARE VLESS WORKERS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha512-Fo3rlrZj/k7ujTnHg4C+6PCWJ+8zzHcXQjXGp6n5Yh9rX0x5fOdPaOqO+e2X4R5C1aE/BSqPIG+8y3O6APa8w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', monospace;
    background-color: #0c0c0c;
    color: #00ff00;
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.container {
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0;
    padding: 30px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 1s ease-in-out;
    overflow-y: auto;
    box-sizing: border-box;
}
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
        }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
        }
.header {
    text-align: center;
    margin-bottom: 20px;
        }
.profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
		}
.profile-pic {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    margin: 0;
		}
.profile-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.profile-name {
    color: #00ff00;
    font-size: 20px;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 3px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
}
.header h1 {
    font-size: 24px;
    text-align: center;
    text-transform: uppercase;
    margin: 0;
    text-shadow: 0 0 10px #00ff00;
        }
.nav-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    gap: 20px;
        }
.nav-buttons .button {
    background-color: transparent;
    border: 2px solid #00ff00;
    color: #00ff00;
    padding: 6px 12px;
    font-size: 10px;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
        }
.nav-buttons .button:hover {
    background-color: #00ff00;
    color: black;
    transform: scale(1.05);
        }
.content {
    display: none;
        }
.content.active {
    display: block;
        }
.config-section {
    background: rgba(255, 255, 255, 0.1);
    padding: 10px;
    margin-bottom: 20px;
    position: relative;
    animation: slideIn 0.5s ease-in-out;
        }
@keyframes slideIn {
    from { transform: translateX(-30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
        }
.config-section h3 {
    margin-top: 0;
    color: #00ff00; 
    font-size: 28px;
        }
.config-section p {
    color: #00ff00;
    font-size: 16px;
        }
.config-toggle {
    margin-bottom: 20px;
        }
.config-content {
    display: none;
        }
.config-content.active {
    display: block;
        }
.config-block {
    margin-bottom: 20px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease;
        }
.config-block h4 {
    margin-bottom: 8px;
    color: #00ff00; 
    font-size: 22px;
    font-weight: 600;
        }
.config {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10px;
    border-radius: 0;
    border: 1px solid #00ff00;
    color: #f5f5f5;
    word-wrap: break-word;
    white-space: pre-wrap;
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
        }
.button {
    background-color: transparent;
    color: #00ff00;
    border: 2px solid #00ff00;
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
        }
.button i {
    margin-right: 3px;
        }
.button:hover {
    background-color: #00ff00;
    color: black;
        }
.config-divider {
    border: none;
    height: 1px;
    background: linear-gradient(to right, transparent, #00ff00, transparent);
    margin: 40px 0;
        }
@media (max-width: 768px) {
    .header h1 {
        font-size: 28px;
    }
    .config-section h3 {
        font-size: 24px;
    }
    .config-block h4 {
        font-size: 20px;
    }
        }
    </style>
</head>
<body>
    <div class="overlay"></div>
    <div class="container">
        <div class="header">
            <div class="profile-container">
				<img src="https://avatars.githubusercontent.com/u/61716582?v=4" alt="VLESS CLOUDFLARE" class="profile-pic">
				<h2 class="profile-name">CLOUDFLARE VLESS WORKERS</h2>
			</div>
        </div>
        <div class="nav-buttons">
            <button class="button" onclick="showContent('vless')">VLESS MENU</button>
            <button class="button" onclick="showContent('clash')">CLASH MENU</button>
			<button class="button" onclick="showContent('info')">INFO</button>
        </div>
        <div id="vless" class="content active">
            ${vlessConfigs}
        </div>
        <div id="clash" class="content">
            ${clashConfigs}
        </div>
		<div id="info" class="content">
			<p>Workers ini baru support wildcard <strong>support.zoom.us</strong></p>
			<!-- Tambahkan tombol CHAT di sini -->
			<a href="https://t.me/vpnjatim" target="_blank">
				<button class="button" style="margin-top: 10px;">CHAT ME</button>
			</a>
		</div>
    </div>

    <script>
        function showContent(contentId) {
            const contents = document.querySelectorAll('.content');
            contents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(contentId).classList.add('active');
        }
        function salinTeks() {
            var teks = document.getElementById('teksAsli');
            teks.select();
            document.execCommand('copy');
            alert('Teks telah disalin.');
        }
        function copyClash(elementId) {
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text)
            .then(() => {
                const alertBox = document.createElement('div');
                alertBox.textContent = "Copied to clipboard!";
                alertBox.style.position = 'fixed';
                alertBox.style.bottom = '20px';
                alertBox.style.right = '20px';
                alertBox.style.backgroundColor = 'green';
                alertBox.style.color = '#fff';
                alertBox.style.padding = '10px 20px';
                alertBox.style.borderRadius = '5px';
                alertBox.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                alertBox.style.opacity = '0';
                alertBox.style.transition = 'opacity 0.5s ease-in-out';
                document.body.appendChild(alertBox);
                setTimeout(() => {
                    alertBox.style.opacity = '1';
                }, 100);
                setTimeout(() => {
                    alertBox.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(alertBox);
                    }, 500);
                }, 2000);
            })
            .catch((err) => {
                console.error("Failed to copy to clipboard:", err);
            });
        }
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    const alertBox = document.createElement('div');
                    alertBox.textContent = "Copied to clipboard!";
                    alertBox.style.position = 'fixed';
                    alertBox.style.bottom = '20px';
                    alertBox.style.right = '20px';
                    alertBox.style.backgroundColor = 'green';
                    alertBox.style.color = '#fff';
                    alertBox.style.padding = '10px 20px';
                    alertBox.style.borderRadius = '5px';
                    alertBox.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    alertBox.style.opacity = '0';
                    alertBox.style.transition = 'opacity 0.5s ease-in-out';
                    document.body.appendChild(alertBox);
                    setTimeout(() => {
                        alertBox.style.opacity = '1';
                    }, 100);
                    setTimeout(() => {
                        alertBox.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(alertBox);
                        }, 500);
                    }, 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy to clipboard:", err);
                });
        }

        function toggleConfig(button, show, hide) {
            const configContent = button.nextElementSibling;
            if (configContent.classList.contains('active')) {
                configContent.classList.remove('active');
                button.textContent = show;
            } else {
                configContent.classList.add('active');
                button.textContent = hide;
            }
        }
    </script>
</body>
</html>`;
        return htmlConfigs;
    } catch (error) {
        return `An error occurred while generating the VLESS configurations. ${error}`;
    }
}
/*
function generateUUIDv4() {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;
  return [
    randomValues[0].toString(16).padStart(2, '0'),
    randomValues[1].toString(16).padStart(2, '0'),
    randomValues[2].toString(16).padStart(2, '0'),
    randomValues[3].toString(16).padStart(2, '0'),
    randomValues[4].toString(16).padStart(2, '0'),
    randomValues[5].toString(16).padStart(2, '0'),
    randomValues[6].toString(16).padStart(2, '0'),
    randomValues[7].toString(16).padStart(2, '0'),
    randomValues[8].toString(16).padStart(2, '0'),
    randomValues[9].toString(16).padStart(2, '0'),
    randomValues[10].toString(16).padStart(2, '0'),
    randomValues[11].toString(16).padStart(2, '0'),
    randomValues[12].toString(16).padStart(2, '0'),
    randomValues[13].toString(16).padStart(2, '0'),
    randomValues[14].toString(16).padStart(2, '0'),
    randomValues[15].toString(16).padStart(2, '0')
].join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}*/
async function vlessOverWSHandler(request) {
  /** @type {import("@cloudflare/workers-types").WebSocket[]} */
  // @ts-ignore
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);

  webSocket.accept();

  let address = "";
  let portWithRandomLog = "";
  const log = (/** @type {string} */ info, /** @type {string | undefined} */ event) => {
    console.log(`[${address}:${portWithRandomLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

  /** @type {{ value: import("@cloudflare/workers-types").Socket | null}}*/
  let remoteSocketWapper = {
    value: null,
  };
  let udpStreamWrite = null;
  let isDns = false;

  // ws --> remote
  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDns && udpStreamWrite) {
            return udpStreamWrite(chunk);
          }
          if (remoteSocketWapper.value) {
            const writer = remoteSocketWapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const {
            hasError,
            message,
            portRemote = 443,
            addressRemote = "",
            rawDataIndex,
            vlessVersion = new Uint8Array([0, 0]),
            isUDP,
          } = await processVlessHeader(chunk, userID);
          // Mendapatkan tanggal sekarang
          const currentDate = new Date();
          const expirationDate = new Date(expired);

          // Memeriksa apakah tanggal sudah melewati tanggal kedaluwarsa
          if (currentDate >= expirationDate) {
            // Menutup koneksi jika kedaluwarsa
            webSocket.close(1000, "Connection expired. Access is not allowed.");
            return; // Menghentikan eksekusi lebih lanjut
          }
          address = addressRemote;
          portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? "udp " : "tcp "} `;
          if (hasError) {
            // controller.error(message);
            throw new Error(message); // cf seems has bug, controller.error will not end stream
            // webSocket.close(1000, message);
            return;
          }
          // if UDP but port not DNS port, close it
          if (isUDP) {
            if (portRemote === 53) {
              isDns = true;
            } else {
              // controller.error('UDP proxy only enable for DNS which is port 53');
              throw new Error("UDP proxy only enable for DNS which is port 53"); // cf seems has bug, controller.error will not end stream
              return;
            }
          }
          // ["version", "附加信息长度 N"]
          const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
          const rawClientData = chunk.slice(rawDataIndex);

          // TODO: support udp here when cf runtime has udp support
          if (isDns) {
            const { write } = await handleUDPOutBound(webSocket, vlessResponseHeader, log);
            udpStreamWrite = write;
            udpStreamWrite(rawClientData);
            return;
          }
          handleTCPOutBound(
            remoteSocketWapper,
            addressRemote,
            portRemote,
            rawClientData,
            webSocket,
            vlessResponseHeader,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response(null, {
    status: 101,
    // @ts-ignore
    webSocket: client,
  });
}

/**
 * Checks if a given UUID is present in the API response.
 * @param {string} targetUuid The UUID to search for.
 * @returns {Promise<boolean>} A Promise that resolves to true if the UUID is present in the API response, false otherwise.
 */
async function checkUuidInApiResponse(targetUuid) {
  // Check if any of the environment variables are empty

  try {
    const apiResponse = await getApiResponse();
    if (!apiResponse) {
      return false;
    }
    const isUuidInResponse = apiResponse.users.some((user) => user.uuid === targetUuid);
    return isUuidInResponse;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

/**
 * Handles outbound TCP connections.
 *
 * @param {any} remoteSocket
 * @param {string} addressRemote The remote address to connect to.
 * @param {number} portRemote The remote port to connect to.
 * @param {Uint8Array} rawClientData The raw client data to write.
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket The WebSocket to pass the remote socket to.
 * @param {Uint8Array} vlessResponseHeader The VLESS response header.
 * @param {function} log The logging function.
 * @returns {Promise<void>} The remote socket.
 */
async function handleTCPOutBound(
  remoteSocket,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  vlessResponseHeader,
  log
) {
  async function connectAndWrite(address, port) {
    if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address)) address = `${atob('d3d3Lg==')}${address}${atob('LnNzbGlwLmlv')}`;
    /** @type {import("@cloudflare/workers-types").Socket} */
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData); // first write, nomal is tls client hello
    writer.releaseLock();
    return tcpSocket;
  }

  // if the cf connect tcp socket have no incoming data, we retry to redirect ip
  async function retry() {
    const tcpSocket = await connectAndWrite(proxyIP || addressRemote, proxyPort || portRemote);
    // no matter retry success or not, close websocket
    tcpSocket.closed
      .catch((error) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);

  // when remoteSocket is ready, pass to websocket
  // remote--> ws
  remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
}

/**
 *
 * @param {import("@cloudflare/workers-types").WebSocket} webSocketServer
 * @param {string} earlyDataHeader for ws 0rtt
 * @param {(info: string)=> void} log for ws 0rtt
 */
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });

      // The event means that the client closed the client -> server stream.
      // However, the server -> client stream is still open until you call close() on the server side.
      // The WebSocket protocol says that a separate close message must be sent in each direction to fully close the socket.
      webSocketServer.addEventListener("close", () => {
        // client send close, need close server
        // if stream is cancel, skip controller.close
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      // for ws 0rtt
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {
      // if ws can stop read if stream is full, we can implement backpressure
      // https://streams.spec.whatwg.org/#example-rs-push-backpressure
    },
    cancel(reason) {
      // 1. pipe WritableStream has error, this cancel will called, so ws handle server close into here
      // 2. if readableStream is cancel, all controller.close/enqueue need skip,
      // 3. but from testing controller.error still work even if readableStream is cancel
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

// https://xtls.github.io/development/protocols/vless.html
// https://github.com/zizifn/excalidraw-backup/blob/main/v2ray-protocol.excalidraw

/**
 *
 * @param { ArrayBuffer} vlessBuffer
 * @param {string} userID
 * @returns
 */
async function processVlessHeader(vlessBuffer, userID) {
  if (vlessBuffer.byteLength < 24) {
    return {
      hasError: true,
      message: "invalid data",
    };
  }
  const version = new Uint8Array(vlessBuffer.slice(0, 1));
  let isValidUser = false;
  let isUDP = false;
  const slicedBuffer = new Uint8Array(vlessBuffer.slice(1, 17));
  const slicedBufferString = stringify(slicedBuffer);

  const uuids = userID.includes(",") ? userID.split(",") : [userID];

  const checkUuidInApi = await checkUuidInApiResponse(slicedBufferString);
  isValidUser = uuids.some((userUuid) => checkUuidInApi || slicedBufferString === userUuid.trim());

  console.log(`checkUuidInApi: ${await checkUuidInApiResponse(slicedBufferString)}, userID: ${slicedBufferString}`);

  if (!isValidUser) {
    return {
      hasError: true,
      message: "invalid user",
    };
  }

  const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
  //skip opt for now

  const command = new Uint8Array(vlessBuffer.slice(18 + optLength, 18 + optLength + 1))[0];

  // 0x01 TCP
  // 0x02 UDP
  // 0x03 MUX
  if (command === 1) {
  } else if (command === 2) {
    isUDP = true;
  } else {
    return {
      hasError: true,
      message: `command ${command} is not support, command 01-tcp,02-udp,03-mux`,
    };
  }
  const portIndex = 18 + optLength + 1;
  const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
  // port is big-Endian in raw data etc 80 == 0x005d
  const portRemote = new DataView(portBuffer).getUint16(0);

  let addressIndex = portIndex + 2;
  const addressBuffer = new Uint8Array(vlessBuffer.slice(addressIndex, addressIndex + 1));

  // 1--> ipv4  addressLength =4
  // 2--> domain name addressLength=addressBuffer[1]
  // 3--> ipv6  addressLength =16
  const addressType = addressBuffer[0];
  let addressLength = 0;
  let addressValueIndex = addressIndex + 1;
  let addressValue = "";
  switch (addressType) {
    case 1:
      addressLength = 4;
      addressValue = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)).join(".");
      break;
    case 2:
      addressLength = new Uint8Array(vlessBuffer.slice(addressValueIndex, addressValueIndex + 1))[0];
      addressValueIndex += 1;
      addressValue = new TextDecoder().decode(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      break;
    case 3:
      addressLength = 16;
      const dataView = new DataView(vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength));
      // 2001:0db8:85a3:0000:0000:8a2e:0370:7334
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      addressValue = ipv6.join(":");
      // seems no need add [] for ipv6
      break;
    default:
      return {
        hasError: true,
        message: `invild  addressType is ${addressType}`,
      };
  }
  if (!addressValue) {
    return {
      hasError: true,
      message: `addressValue is empty, addressType is ${addressType}`,
    };
  }

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    vlessVersion: version,
    isUDP,
  };
}

/**
 *
 * @param {import("@cloudflare/workers-types").Socket} remoteSocket
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket
 * @param {ArrayBuffer} vlessResponseHeader
 * @param {(() => Promise<void>) | null} retry
 * @param {*} log
 */
async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log) {
  // remote--> ws
  let remoteChunkCount = 0;
  let chunks = [];
  /** @type {ArrayBuffer | null} */
  let vlessHeader = vlessResponseHeader;
  let hasIncomingData = false; // check if remoteSocket has incoming data
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        /**
         *
         * @param {Uint8Array} chunk
         * @param {*} controller
         */
        async write(chunk, controller) {
          hasIncomingData = true;
          // remoteChunkCount++;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (vlessHeader) {
            webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
            vlessHeader = null;
          } else {
            // seems no need rate limit this, CF seems fix this??..
            // if (remoteChunkCount > 20000) {
            // 	// cf one package is 4096 byte(4kb),  4096 * 20000 = 80M
            // 	await delay(1);
            // }
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
          // safeCloseWebSocket(webSocket); // no need server close websocket frist for some case will casue HTTP ERR_CONTENT_LENGTH_MISMATCH issue, client will send close event anyway.
        },
        abort(reason) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });

  // seems is cf connect socket have error,
  // 1. Socket.closed will have error
  // 2. Socket.readable will be close without any data coming
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

/**
 *
 * @param {string} base64Str
 * @returns
 */
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) {
    return { error: null };
  }
  try {
    // go use modified Base64 for URL rfc4648 which js atob not support
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * This is not real UUID validation
 * @param {string} uuid
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
/**
 * Normally, WebSocket will not has exceptions when close.
 * @param {import("@cloudflare/workers-types").WebSocket} socket
 */
function safeCloseWebSocket(socket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    "-" +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    "-" +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    "-" +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    "-" +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!isValidUUID(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
 
/**
 *
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket
 * @param {ArrayBuffer} vlessResponseHeader
 * @param {(string)=> void} log
 */
async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {
  let isVlessHeaderSent = false;
  const transformStream = new TransformStream({
    start(controller) {},
    transform(chunk, controller) {
      // udp message 2 byte is the the length of udp data
      // TODO: this should have bug, beacsue maybe udp chunk can be in two websocket message
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPakcetLength));
        index = index + 2 + udpPakcetLength;
        controller.enqueue(udpData);
      }
    },
    flush(controller) {},
  });

  // only handle dns udp for now
  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          const resp = await fetch(
            dohURL, // dns server url
            {
              method: "POST",
              headers: {
                "content-type": "application/dns-message",
              },
              body: chunk,
            }
          );
          const dnsQueryResult = await resp.arrayBuffer();
          const udpSize = dnsQueryResult.byteLength;
          // console.log([...new Uint8Array(dnsQueryResult)].map((x) => x.toString(16)));
          const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            log(`doh success and dns message length is ${udpSize}`);
            if (isVlessHeaderSent) {
              webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
            } else {
              webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              isVlessHeaderSent = true;
            }
          }
        },
      })
    )
    .catch((error) => {
      log("dns udp has error" + error);
    });

  const writer = transformStream.writable.getWriter();

  return {
    /**
     *
     * @param {Uint8Array} chunk
     */
    write(chunk) {
      writer.write(chunk);
    },
  };
}
