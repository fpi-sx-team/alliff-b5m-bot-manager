dev_name = "AlliFF"
owner_user = "@Alli"
insta = "@Alli"
tok = "@Alli"

import requests , os , psutil , sys , jwt , pickle , json , binascii , time , urllib3 , base64 , datetime , re , socket , threading , ssl , pytz , aiohttp , asyncio
from protobuf_decoder.protobuf_decoder import Parser
from CTX import * 
from MASRY import *
from datetime import datetime
from google.protobuf.timestamp_pb2 import Timestamp
from concurrent.futures import ThreadPoolExecutor
from threading import Thread
from Pb2 import DEcwHisPErMsG_pb2 , MajoRLoGinrEs_pb2 , PorTs_pb2 , MajoRLoGinrEq_pb2 , sQ_pb2 , Team_msg_pb2
from cfonts import render, say

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)  


ADMIN_UID = "760840390"
online_writer = None
whisper_writer = None
spam_room = False
spammer_uid = None
spam_chat_id = None
spam_uid = None
Spy = False
lag_task = None
Chat_Leave = False
is_muted = False
mute_until = 0
spam_requests_sent = 0
bot_start_time = time.time()
danger_spam_active = False
evo_cycle_active = False
current_evo_index = 0
evo_emotes = [
    909000063, 909000068, 909000075, 909000081, 909000085, 909000090, 909000098, 909033001, 909035007, 909037011,  909038010, 909038012, 909039011, 909040010,909041005, 909042008, 909045001, 909051003
]

connection_pool = None
command_cache = {}
last_request_time = {}
RATE_LIMIT_DELAY = 0.1  
MAX_CACHE_SIZE = 50
CLEANUP_INTERVAL = 300


command_stats = {}



def cleanup_cache():
    current_time = time.time()
    to_remove = [k for k, v in last_request_time.items() 
                 if current_time - v > CLEANUP_INTERVAL]
    for k in to_remove:
        last_request_time.pop(k, None)
    
    if len(command_cache) > MAX_CACHE_SIZE:
        oldest_keys = sorted(command_cache.keys())[:len(command_cache)//2]
        for key in oldest_keys:
            command_cache.pop(key, None)

def get_rate_limited_response(user_id):
    user_key = str(user_id)
    current_time = time.time()
    
    if user_key in last_request_time:
        time_since_last = current_time - last_request_time[user_key]
        if time_since_last < RATE_LIMIT_DELAY:
            return False
    
    last_request_time[user_key] = current_time
    return True

async def lag_team_loop(team_code, key, iv, region):
    global lag_running
    count = 0
    
    while lag_running:
        try:
            join_packet = await GenJoinSquadsPacket(team_code, key, iv)
            await SEndPacKeT(whisper_writer, online_writer, 'OnLine', join_packet)
            
            await asyncio.sleep(0.01) 
            
            leave_packet = await ExiT(None, key, iv)
            await SEndPacKeT(whisper_writer, online_writer, 'OnLine', leave_packet)
            
            count += 1
            
            await asyncio.sleep(0.01)  
            
        except Exception as e:
            print(f"Error in lag loop: {e}")
            await asyncio.sleep(0.1)
            
            
def spam_requests(player_id):
    global spam_requests_sent
    cache_key = f"spam_{player_id}"
    
    if cache_key in command_cache:
        return command_cache[cache_key]
    
    try:

        url = f"https://masry-spam-phi.vercel.app/send_requests?uid={player_id}&region=me&key=CTX-TEAM"
        res = requests.get(url, timeout=15)
        
        if res.status_code == 200:
            try:
                data = res.json()
            except:
                return "[FF0000]Invalid response format from server"
            spam_requests_sent += 1
            success_count = data.get('total_accounts', 110)
            failed_count = data.get('failed_count', 0)

            result = f"[FF6347]Group Requests Sent!\n[00FF00]✅ Success: {success_count}\n[FF0000]❌ Failed: {failed_count}"
            command_cache[cache_key] = result
            cleanup_cache()
            return result
        else:
            try:
                alt_url = f"https://masry-spam-phi.vercel.app/send_requests?uid={player_id}&region=me&key=CTX-TEAM"
                alt_res = requests.get(alt_url, timeout=15)
                if alt_res.status_code == 200:
                    try:
                        alt_data = alt_res.json()
                    except:
                        return "[FF0000]Invalid response format from server"
                    spam_requests_sent += 1
                    result = f"[FF6347]Group Requests Sent!\n[00FF00]✅ Success: {alt_data.get('total_accounts', 110)}\n[FF0000]❌ Failed: {alt_data.get('failed', 0)}"
                    command_cache[cache_key] = result
                    cleanup_cache()
                    return result
            except:
                pass
            return f"[FF0000]API Error: {res.status_code}"
    except requests.exceptions.Timeout:
        return "[FF0000]Spam API timeout - please try again"
    except requests.exceptions.RequestException as e:
        return f"[FF0000]Spam API error: Connection failed"
    except Exception as e:
        return "[FF0000]Unexpected error occurred"


def talk_with_ai(question):
    url = f"https://princeaiapi.vercel.app/prince/api/v1/ask?key=prince&ask={question}"
    res = requests.get(url)
    if res.status_code == 200:
        try:
            data = res.json()
        except:
            return "Error: Invalid response from AI server"
        msg = data["message"]["content"]
        return msg
    else:
        return "An error occurred while connecting to the server."



login_url , ob , version = AuToUpDaTE()


Hr = {
    'User-Agent': Uaa(),
    'Connection': "Keep-Alive",
    'Accept-Encoding': "gzip",
    'Content-Type': "application/x-www-form-urlencoded",
    'Expect': "100-continue",
    'X-Unity-Version': "2018.4.11f1",
    'X-GA': "v1 1",
    'ReleaseVersion': ob}

def get_random_color():
    colors = [
        "[FF0000]", "[00FF00]", "[0000FF]", "[FFFF00]", "[FF00FF]", "[00FFFF]", "[FFFFFF]", "[FFA500]",
        "[DC143C]", "[00CED1]", "[9400D3]", "[F08080]", "[20B2AA]", "[FF1493]", "[7CFC00]", "[B22222]",
        "[FF4500]", "[DAA520]", "[00BFFF]", "[00FF7F]", "[4682B4]", "[6495ED]", "[DDA0DD]", "[E6E6FA]",
        "[2E8B57]", "[3CB371]", "[6B8E23]", "[808000]", "[B8860B]", "[CD5C5C]", "[8B0000]", "[FF6347]"
    ]
    return random.choice(colors)

def is_admin(uid):
    return str(uid) == ADMIN_UID

def is_bot_muted():
    global is_muted, mute_until
    if is_muted and time.time() < mute_until:
        return True
    elif is_muted and time.time() >= mute_until:
        is_muted = False
        mute_until = 0
        return False
    return False

def update_command_stats(command):
    if command not in command_stats:
        command_stats[command] = 0
    command_stats[command] += 1

async def safe_send_message(chat_type, message, target_uid, chat_id, key, iv, max_retries=3):
    for attempt in range(max_retries):
        try:
            P = await SEndMsG(chat_type, message, target_uid, chat_id, key, iv)
            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
            print(f"Message sent successfully on attempt {attempt + 1}")
            return True
        except Exception as e:
            print(f"Failed to send message (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(0.5)  
    return False
    
    
async def encrypted_proto(encoded_hex):
    key = b'Yg&tc%DEuh6%Zc^8'
    iv = b'6oyZDr22E3ychjM%'
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded_message = pad(encoded_hex, AES.block_size)
    encrypted_payload = cipher.encrypt(padded_message)
    return encrypted_payload
    
async def GeNeRaTeAccEss(uid , password):
    url = "https://100067.connect.garena.com/oauth/guest/token/grant"
    headers = {
        "Host": "100067.connect.garena.com",
        "User-Agent": (await Ua()),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "close"}
    data = {
        "uid": uid,
        "password": password,
        "response_type": "token",
        "client_type": "2",
        "client_secret": "2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3",
        "client_id": "100067"}
    try:
        async with connection_pool.post(url, headers=Hr, data=data) as response:
            if response.status != 200: 
                return "Failed to get access token"
            data = await response.json()
            open_id = data.get("open_id")
            access_token = data.get("access_token")
            return (open_id, access_token) if open_id and access_token else (None, None)
    except:
        return (None, None)

async def GeNeRaTeAccEss(uid , password):
    url = "https://100067.connect.garena.com/oauth/guest/token/grant"
    headers = {
        "Host": "100067.connect.garena.com",
        "User-Agent": (await Ua()),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "close"}
    data = {
        "uid": uid,
        "password": password,
        "response_type": "token",
        "client_type": "2",
        "client_secret": "2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3",
        "client_id": "100067"}
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=Hr, data=data) as response:
            if response.status != 200: return await response.read()
            data = await response.json()
            open_id = data.get("open_id")
            access_token = data.get("access_token")
            return (open_id, access_token) if open_id and access_token else (None, None)

async def EncRypTMajoRLoGin(open_id, access_token):
    major_login = MajoRLoGinrEq_pb2.MajorLogin()
    major_login.event_time = str(datetime.now())[:-7]
    major_login.game_name = "free fire"
    major_login.platform_id = 1
    major_login.client_version = version
    major_login.system_software = "Android OS 9 / API-28 (PQ3B.190801.10101846/G9650ZHU2ARC6)"
    major_login.system_hardware = "Handheld"
    major_login.telecom_operator = "Verizon"
    major_login.network_type = "WIFI"
    major_login.screen_width = 1920
    major_login.screen_height = 1080
    major_login.screen_dpi = "280"
    major_login.processor_details = "ARM64 FP ASIMD AES VMH | 2865 | 4"
    major_login.memory = 3003
    major_login.gpu_renderer = "Adreno (TM) 640"
    major_login.gpu_version = "OpenGL ES 3.1 v1.46"
    major_login.unique_device_id = "Google|34a7dcdf-a7d5-4cb6-8d7e-3b0e448a0c57"
    major_login.client_ip = "223.191.51.89"
    major_login.language = "en"
    major_login.open_id = open_id
    major_login.open_id_type = "4"
    major_login.device_type = "Handheld"
    memory_available = major_login.memory_available
    memory_available.version = 55
    memory_available.hidden_value = 81
    major_login.access_token = access_token
    major_login.platform_sdk_id = 1
    major_login.network_operator_a = "Verizon"
    major_login.network_type_a = "WIFI"
    major_login.client_using_version = "7428b253defc164018c604a1ebbfebdf"
    major_login.external_storage_total = 36235
    major_login.external_storage_available = 31335
    major_login.internal_storage_total = 2519
    major_login.internal_storage_available = 703
    major_login.game_disk_storage_available = 25010
    major_login.game_disk_storage_total = 26628
    major_login.external_sdcard_avail_storage = 32992
    major_login.external_sdcard_total_storage = 36235
    major_login.login_by = 3
    major_login.library_path = "/data/app/com.dts.freefireth-YPKM8jHEwAJlhpmhDhv5MQ==/lib/arm64"
    major_login.reg_avatar = 1
    major_login.library_token = "5b892aaabd688e571f688053118a162b|/data/app/com.dts.freefireth-YPKM8jHEwAJlhpmhDhv5MQ==/base.apk"
    major_login.channel_type = 3
    major_login.cpu_type = 2
    major_login.cpu_architecture = "64"
    major_login.client_version_code = "2019118695"
    major_login.graphics_api = "OpenGLES2"
    major_login.supported_astc_bitset = 16383
    major_login.login_open_id_type = 4
    major_login.analytics_detail = b"FwQVTgUPX1UaUllDDwcWCRBpWAUOUgsvA1snWlBaO1kFYg=="
    major_login.loading_time = 13564
    major_login.release_channel = "android"
    major_login.extra_info = "KqsHTymw5/5GB23YGniUYN2/q47GATrq7eFeRatf0NkwLKEMQ0PK5BKEk72dPflAxUlEBir6Vtey83XqF593qsl8hwY="
    major_login.android_engine_init_flag = 110009
    major_login.if_push = 1
    major_login.is_vpn = 1
    major_login.origin_platform_type = "4"
    major_login.primary_platform_type = "4"
    string = major_login.SerializeToString()
    
    return  await encrypted_proto(string)

async def MajorLogin(payload):
    url = f"{login_url}MajorLogin"
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=payload, headers=Hr, ssl=ssl_context) as response:
            if response.status == 200: return await response.read()
            return None

async def GetLoginData(base_url, payload, token):
    url = f"{base_url}/GetLoginData"
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    Hr['Authorization']= f"Bearer {token}"
    try:
        async with connection_pool.post(url, data=payload, headers=Hr, ssl=ssl_context) as response:
            if response.status == 200: 
                return await response.read()
            return None
    except:
        return None

async def DecRypTMajoRLoGin(MajoRLoGinResPonsE):
    proto = MajoRLoGinrEs_pb2.MajorLoginRes()
    proto.ParseFromString(MajoRLoGinResPonsE)
    return proto

async def DecRypTLoGinDaTa(LoGinDaTa):
    proto = PorTs_pb2.GetLoginData()
    proto.ParseFromString(LoGinDaTa)
    return proto

async def DecodeWhisperMessage(hex_packet):
    packet = bytes.fromhex(hex_packet)
    proto = DEcwHisPErMsG_pb2.DecodeWhisper()
    proto.ParseFromString(packet)
    return proto
    
async def decode_team_packet(hex_packet):
    packet = bytes.fromhex(hex_packet)
    proto = sQ_pb2.recieved_chat()
    proto.ParseFromString(packet)
    return proto
    
async def xAuThSTarTuP(TarGeT, token, timestamp, key, iv):
    uid_hex = hex(TarGeT)[2:]
    uid_length = len(uid_hex)
    encrypted_timestamp = await DecodE_HeX(timestamp)
    encrypted_account_token = token.encode().hex()
    encrypted_packet = await EnC_PacKeT(encrypted_account_token, key, iv)
    encrypted_packet_length = hex(len(encrypted_packet) // 2)[2:]
    if uid_length == 9: 
        headers = '0000000'
    elif uid_length == 8: 
        headers = '00000000'
    elif uid_length == 10: 
        headers = '000000'
    elif uid_length == 7: 
        headers = '000000000'
    else: 
        print('Unexpected length') 
        headers = '0000000'
    return f"0115{headers}{uid_hex}{encrypted_timestamp}00000{encrypted_packet_length}{encrypted_packet}"
     
async def cHTypE(H):
    if not H: 
        return 'Squid'
    elif H == 1: 
        return 'CLan'
    elif H == 2: 
        return 'PrivaTe'
    
async def SEndMsG(H , message , Uid , chat_id , key , iv):
    TypE = await cHTypE(H)
    if TypE == 'Squid': 
        msg_packet = await xSEndMsgsQ(message , chat_id , key , iv)
    elif TypE == 'CLan': 
        msg_packet = await xSEndMsg(message , 1 , chat_id , chat_id , key , iv)
    elif TypE == 'PrivaTe': 
        msg_packet = await xSEndMsg(message , 2 , Uid , Uid , key , iv)
    return msg_packet

async def SEndPacKeT(OnLinE , ChaT , TypE , PacKeT):
    if TypE == 'ChaT' and ChaT: 
        whisper_writer.write(PacKeT) 
        await whisper_writer.drain()
    elif TypE == 'OnLine': 
        online_writer.write(PacKeT) 
        await online_writer.drain()
    else: 
        return 'UnsoPorTed TypE ! >> ErrrroR (:():)' 
        
async def danger_spam_command(uids, emote_id, key, iv, region):
    global danger_spam_active
    danger_spam_active = True
    count = 0
    while danger_spam_active and count < 20:
        for uid in uids:
            if not danger_spam_active:
                break
            try:
                H = await Emote_k(uid, emote_id, key, iv, region)
                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', H)
            except:
                pass
            await asyncio.sleep(0.1)
        count += 1
        await asyncio.sleep(0.5)
    danger_spam_active = False


async def evo_cycle_command(uids, key, iv, region):
    global evo_cycle_active, current_evo_index, evo_emotes
    evo_cycle_active = True
    while evo_cycle_active:
        emote_id = evo_emotes[current_evo_index]
        for uid in uids:
            if not evo_cycle_active:
                break
            try:
                H = await Emote_k(uid, emote_id, key, iv, region)
                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', H)
            except:
                pass
            await asyncio.sleep(0.1)

        current_evo_index = (current_evo_index + 1) % len(evo_emotes)
        await asyncio.sleep(8)


async def stop_commands():
    global evo_cycle_active, danger_spam_active
    evo_cycle_active = False
    danger_spam_active = False
def _encrypt_inner_packet(packet_hex: str, key: str, iv: str) -> str:
    k = key if isinstance(key, bytes) else bytes.fromhex(key)
    v = iv if isinstance(iv, bytes) else bytes.fromhex(iv)
    data = bytes.fromhex(packet_hex)
    cipher = AES.new(k, AES.MODE_CBC, v)
    return cipher.encrypt(pad(data, AES.block_size)).hex()
    
    
def pkt_skwad_maker(key: str, iv: str) -> bytes:
    fields = {
        1: 1,
        2: {
            2: "\u0001",
            3: 1,
            4: 1,
            5: "en",
            9: 1,
            11: 1,
            13: 1,
            14: {2: 5756, 6: 11, 8: "1.114.8", 9: 3, 10: 2},
        },
    }
    packet = create_protobuf_packet(fields).hex()
    enc_len = len(encrypt_packet(packet, key, iv)) // 2
    head = _dec_to_hex(enc_len)
    if len(head) == 2:
        final = "0515000000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 3:
        final = "051500000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 4:
        final = "05150000" + head + _encrypt_inner_packet(packet, key, iv)
    else:
        final = "0515000" + head + _encrypt_inner_packet(packet, key, iv)
    return bytes.fromhex(final)

def pkt_changes(num: int, key: str, iv: str) -> bytes:
    fields = {
        1: 17,
        2: {1: 12480598706, 2: 1, 3: int(num), 4: 62, 5: "\u001a", 8: 5, 13: 329},
    }
    packet = create_protobuf_packet(fields).hex()
    enc_len = len(encrypt_packet(packet, key, iv)) // 2
    head = _dec_to_hex(enc_len)
    if len(head) == 2:
        final = "0515000000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 3:
        final = "051500000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 4:
        final = "05150000" + head + _encrypt_inner_packet(packet, key, iv)
    else:
        final = "0515000" + head + _encrypt_inner_packet(packet, key, iv)
    return bytes.fromhex(final)

def pkt_invite_skwad(idplayer: str, key: str, iv: str) -> bytes:
    fields = {1: 2, 2: {1: int(idplayer), 2: "ME", 4: 1}}
    packet = create_protobuf_packet(fields).hex()
    enc_len = len(encrypt_packet(packet, key, iv)) // 2
    head = _dec_to_hex(enc_len)
    if len(head) == 2:
        final = "0515000000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 3:
        final = "051500000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 4:
        final = "05150000" + head + _encrypt_inner_packet(packet, key, iv)
    else:
        final = "0515000" + head + _encrypt_inner_packet(packet, key, iv)
    return bytes.fromhex(final)

def pkt_request_skwad(idplayer: str, key: str, iv: str) -> bytes:
    fields = {
        1: 33,
        2: {
            1: int(idplayer),
            2: "ME",
            3: 1,
            4: 1,
            7: 330,
            8: 19459,
            9: 100,
            12: 1,
            16: 1,
            17: {2: 94, 6: 11, 8: "1.114.8", 9: 3, 10: 2},
            18: 201,
            23: {2: 1, 3: 1},
            24: int(get_random_avatar()),
            26: {},
            28: {},
        },
    }
    packet = create_protobuf_packet(fields).hex()
    enc_len = len(encrypt_packet(packet, key, iv)) // 2
    head = _dec_to_hex(enc_len)
    if len(head) == 2:
        final = "0515000000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 3:
        final = "051500000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 4:
        final = "05150000" + head + _encrypt_inner_packet(packet, key, iv)
    else:
        final = "0515000" + head + _encrypt_inner_packet(packet, key, iv)
    return bytes.fromhex(final)

def pkt_leave_s(key: str, iv: str) -> bytes:
    fields = {
        1: 7,
        2: {
            1: 12480598706
        }
    }

    packet = create_protobuf_packet(fields).hex()
    enc_len = len(encrypt_packet(packet, key, iv)) // 2
    head = _dec_to_hex(enc_len)

    if len(head) == 2:
        final = "0515000000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 3:
        final = "051500000" + head + _encrypt_inner_packet(packet, key, iv)
    elif len(head) == 4:
        final = "05150000" + head + _encrypt_inner_packet(packet, key, iv)
    else:
        final = "0515000" + head + _encrypt_inner_packet(packet, key, iv)

    return bytes.fromhex(final)

async def MuTe(Uid, K, V):
    fields = {1: 3, 2: {1: int(Uid), 3: "ar", 4: "1750728024661459697_3qind8eeqs"}}
    return GeneRaTePk(str(CrEaTe_ProTo(fields).hex()), '1201', K, V)        

async def TcPOnLine(ip, port, key, iv, AutHToKen, reconnect_delay=0.5):
    global online_writer , spam_room , whisper_writer , spammer_uid , spam_chat_id , spam_uid , XX , uid , Spy,data2, Chat_Leave, lag_running, lag_task
    
    while True:
        try:
            reader , writer = await asyncio.open_connection(ip, int(port))
            online_writer = writer
            bytes_payload = bytes.fromhex(AutHToKen)
            online_writer.write(bytes_payload)
            await online_writer.drain()
            while True:
                data2 = await reader.read(9999)
                if not data2: 
                    break
                
                if data2.hex().startswith('0500') and len(data2.hex()) > 1000:
                    try:
                        packet = await DeCode_PackEt(data2.hex()[10:])           
                        packet = json.loads(packet)
                        OwNer_UiD , CHaT_CoDe , SQuAD_CoDe = await GeTSQDaTa(packet)

                        JoinCHaT = await AutH_Chat(3 , OwNer_UiD , CHaT_CoDe, key,iv)
                        await SEndPacKeT(whisper_writer , online_writer , 'ChaT' , JoinCHaT)


                        message = f"""
[b]Welcome

{get_random_color()} تم اخََََتَََََراق الاسكواد بواسطه {dev_name}


{get_random_color()} {dev_name}   ＢＯＴ

- {get_random_color()}To see the commands type => [ff0000]/help[ffffff]

- {get_random_color()}By {dev_name}

تابعني او سيتم تبنيد حسابك 

صاحب وصانع البوت هوه

  CTX    MASRY  

[808080]- Follow Me On my tik tok account => [00ff00] {tok}

[808080]- DmWith Me On my telegram account => [00ff00]{owner_user}

[808080]- Follow Me On my Instagram account => [00ff00] {insta}\n"""
                        P = await SEndMsG(0 , message , OwNer_UiD , OwNer_UiD , key , iv)
                        await SEndPacKeT(whisper_writer , online_writer , 'ChaT' , P)

                    except:
                        if data2.hex().startswith('0500') and len(data2.hex()) > 1000:
                            try:
                                packet = await DeCode_PackEt(data2.hex()[10:])
                                print()
                                packet = json.loads(packet)
                                OwNer_UiD , CHaT_CoDe , SQuAD_CoDe = await GeTSQDaTa(packet)

                                JoinCHaT = await AutH_Chat(3 , OwNer_UiD , CHaT_CoDe, key,iv)
                                await SEndPacKeT(whisper_writer , online_writer , 'ChaT' , JoinCHaT)

                                message = f'[B][C]{get_random_color()}\n- WeLComE To Emote Bot ! \n\n{get_random_color()}- Commands : @a {xMsGFixinG('123456789')} {xMsGFixinG('909000001')}\n\n[00FF00]Dev : @{xMsGFixinG('masry-from-CTX')}'
                                P = await SEndMsG(0 , message , OwNer_UiD , OwNer_UiD , key , iv)
                                await SEndPacKeT(whisper_writer , online_writer , 'ChaT' , P)
                            except:
                                pass

            online_writer.close() 
            await online_writer.wait_closed() 
            online_writer = None

        except Exception as e: 
            print(f"- ErroR With {ip}:{port} - {e}") 
            online_writer = None
        await asyncio.sleep(reconnect_delay)

async def TcPChaT(ip, port, AutHToKen, key, iv, LoGinDaTaUncRypTinG, ready_event, region , reconnect_delay=0.5):
    print(region, 'TCP CHAT')

    global spam_room , whisper_writer , spammer_uid , spam_chat_id , spam_uid , online_writer , chat_id , XX , uid , Spy,data2, Chat_Leave, is_muted, mute_until, lag_running, lag_task
    while True:
        try:
            reader , writer = await asyncio.open_connection(ip, int(port))
            whisper_writer = writer
            bytes_payload = bytes.fromhex(AutHToKen)
            whisper_writer.write(bytes_payload)
            await whisper_writer.drain()
            ready_event.set()
            if LoGinDaTaUncRypTinG.Clan_ID:
                clan_id = LoGinDaTaUncRypTinG.Clan_ID
                clan_compiled_data = LoGinDaTaUncRypTinG.Clan_Compiled_Data
                print('\n - TarGeT BoT in CLan ! ')
                print(f' - Clan Uid > {clan_id}')
                print(f' - BoT ConnEcTed WiTh CLan ChaT SuccEssFuLy ! ')
                pK = await AuthClan(clan_id , clan_compiled_data , key , iv)
                if whisper_writer: 
                    whisper_writer.write(pK) 
                    await whisper_writer.drain()
            while True:
                data = await reader.read(9999)
                if not data: 
                    break

                if data.hex().startswith("120000"):
                    msg = await DeCode_PackEt(data.hex()[10:])
                    chatdata = json.loads(msg)
                    try:
                        response = await DecodeWhisperMessage(data.hex()[10:])
                        uid = response.Data.uid
                        chat_id = response.Data.Chat_ID
                        XX = response.Data.chat_type
                        inPuTMsG = response.Data.msg.lower()
                    except:
                        response = None

                    if response:
                        if not get_rate_limited_response(uid):
                            continue

                        if is_bot_muted():
                            continue

                        if inPuTMsG.strip() == "/debug":
                            update_command_stats("debug")
                            debug_msg = f"[FF0000]✅ MASRY BOT ONLINE! UID: 4256907901"
                            P = await SEndMsG(response.Data.chat_type, debug_msg, uid, chat_id, key, iv)
                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            continue
                            
                        if inPuTMsG.startswith("/help"):
                            update_command_stats("help")
                            print(f"Help triggered by 4256907901")
                            if is_admin(uid):
                                message = f"""[C][B]{get_random_color()}CTX  BOT
━━━━━━━━━━━━━━━━━
{get_random_color()}/join [CODE] → لدخول البوت للفريق
{get_random_color()}/e [UID] [EMOTE] → رقصه فرديه
{get_random_color()}/e [UIDs] [EMOTE] → رقص جماعيه
{get_random_color()}/3,/5,/6 → انشاء فريق
{get_random_color()}/solo → مغادره الفريق
{get_random_color()}/ai [Q] → تحدث مع البوت 
{get_random_color()}/ee [TEAM] [UIDs] [E] → عنل رقصه والمغادره
{get_random_color()}evo uid →لعمل جميع الرقصات المطوره 
{get_random_color()}/spam uid →لعمل سبام طلبات صداقه
{get_random_color()}stop → لايقاف الرقصات 
{get_random_color()}/lag [TC] → لاج تيم كود
{get_random_color()}/inv [UID] → جلب شخص بي الاي دي 
━━━━━━━━━━━━━━━━━
{get_random_color()}/stop,/mute,/unmute
━━━━━━━━━━━━━━━━━
{get_random_color()}DEV: {dev_name}"""
                            else:
                                message = f"""[C][B]{get_random_color()}CTX  BOT
━━━━━━━━━━━━━━━━━
{get_random_color()}/join [CODE] → لدخول البوت للفريق
{get_random_color()}/e [UID] [EMOTE] → رقصه فرديه
{get_random_color()}/e [UIDs] [EMOTE] → رقص جماعيه
{get_random_color()}/3,/5,/6 → انشاء فريق
{get_random_color()}/spam uid →لعمل سبام طلبات صداقه
{get_random_color()}/solo → مغادره الفريق
{get_random_color()}/ai [Q] → تحدث مع البوت 
{get_random_color()}/ee [TEAM] [UIDs] [E] → عنل رقصه والمغادره
{get_random_color()}evo uid →لعمل جميع الرقصات المطوره 
{get_random_color()}stop → لايقاف الرقصات 
{get_random_color()}/lag [TC] → لاج تيم كود
{get_random_color()}/inv [UID] → جلب شخص بي الاي دي 
{get_random_color()}/admin → للتواصل مع صانع البوت
━━━━━━━━━━━━━━━━━
{get_random_color()}DEV: {dev_name}"""
                            
                            try:
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            except Exception as e:
                                fallback_msg = "[FF0000]MASRY BOT online! Use /help"
                                P = await SEndMsG(response.Data.chat_type, fallback_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            continue
                        
                        if inPuTMsG.startswith('/ee '):
                            update_command_stats("ee")
                            try:
                                parts = inPuTMsG.strip().split()
                                if len(parts) >= 4:  
                                    team_code = parts[1]  
                                    uids = []
                                    emote_id = None
                                    

                                    for i, part in enumerate(parts[2:], 2): 
                                        if i < len(parts) - 1: 
                                            if part.isdigit():
                                                uids.append(int(part))
                                        else:  
                                            if part.isdigit():
                                                emote_id = int(part)
                                    
                                    if len(uids) >= 1 and emote_id:

                                        processing_msg = f"[FFD700][B]━━━━━━━\n[FFFFFF]Joining: {team_code}\n[FFFFFF]UIDs: {len(uids)}\n[FFFFFF]🎭 Emote: {emote_id}\n[FFD700]━━━━━━━"
                                        P = await SEndMsG(response.Data.chat_type, processing_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                        

                                        try:
                                            join_msg = f"[FF6347][B]🎯 Joining Team: {team_code}"
                                            P_join = await SEndMsG(response.Data.chat_type, join_msg, uid, chat_id, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_join)
                                            
                                            join_packet = await GenJoinSquadsPacket(team_code, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'OnLine', join_packet)
                                            await asyncio.sleep(2) 
                                        except:
                                            pass
                                        

                                        success_count = 0
                                        for target_uid in uids:
                                            try:
                                                H = await Emote_k(target_uid, emote_id, key, iv, region)
                                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', H)
                                                success_count += 1
                                                await asyncio.sleep(0.3)  
                                            except:
                                                pass
                                        
                                        try:
                                            leave_msg = f"[FF0000][B]🚪 Leaving Team: {team_code}"
                                            P_leave = await SEndMsG(response.Data.chat_type, leave_msg, uid, chat_id, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_leave)
                                            
                                            leave_packet = await ExiT(None, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'OnLine', leave_packet)
                                        except:
                                            pass

                                        confirm_msg = f"[00FF00][B]━━━━━━━\n[FFFFFF]✅ Team Emote Complete!\n[FFFFFF]Success: {success_count}/{len(uids)}\n[FFFFFF]Team: {team_code}\n[FFFFFF]🔄 Auto-Leave: ✅\n[FFD700]━━━━━━━"
                                        P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                                    else:
                                        error_msg = f"[FF0000]Usage: /ee [TEAM_CODE] [UID1] [UID2] [UID3] [EMOTE]\nExample: /ee FAST123 1234 5678 9012 1\n[B22222]Will auto-join team and leave after emotes"
                                        P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                else:
                                    error_msg = f"[FF0000]Usage: /ee [TEAM_CODE] [UID1] [UID2] [UID3] [EMOTE]\nExample: /ee FAST123 1234 5678 9012 1\n[B22222]Will auto-join team and leave after emotes"
                                    P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                    await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            except Exception as e:
                                error_msg = f"[FF0000]/ee command error"
                                P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            continue
                       
                        if inPuTMsG.startswith('/stop') and is_admin(uid):
                            update_command_stats("stop")
                            stop_msg = f"[FF0000]MASRY BOT stopping..."
                            P = await SEndMsG(response.Data.chat_type, stop_msg, uid, chat_id, key, iv)
                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            await connection_pool.close()
                            os._exit(0)
                            
                        elif inPuTMsG.startswith('/mute') and is_admin(uid):
                            update_command_stats("mute")
                            try:
                                parts = inPuTMsG.split()
                                if len(parts) >= 2:
                                    time_str = parts[1]
                                    if time_str.endswith('s'):
                                        duration = int(time_str[:-1])
                                    elif time_str.endswith('m'):
                                        duration = int(time_str[:-1]) * 60
                                    elif time_str.endswith('h'):
                                        duration = int(time_str[:-1]) * 3600
                                    else:
                                        duration = int(time_str) * 60
                                    
                                    is_muted = True
                                    mute_until = time.time() + duration
                                    mute_msg = f"[FFB300]MASRY muted {time_str}"
                                else:
                                    mute_msg = f"[FF0000]Usage: /mute 30s/5m/1h"
                                    
                                P = await SEndMsG(response.Data.chat_type, mute_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            except:
                                error_msg = f"[FF0000]Invalid time format"
                                P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                
                        elif inPuTMsG.startswith('/unmute') and is_admin(uid):
                            update_command_stats("unmute")
                            is_muted = False
                            mute_until = 0
                            unmute_msg = f"[00FF00]MASRY unmuted"
                            P = await SEndMsG(response.Data.chat_type, unmute_msg, uid, chat_id, key, iv)
                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            
                        elif inPuTMsG.startswith('/spam') and is_admin(uid):
                            update_command_stats("spam")
                            try:
                                parts = inPuTMsG.split()
                                if len(parts) >= 2:
                                    uids = []
                                    for part in parts[1:]:
                                        if part.isdigit():
                                            uids.append(part)
                                    
                                    if uids:

                                        processing_msg = f"[FF6347][B]━━━━━━━\n[FFFFFF]Group Requests: {len(uids)} UIDs\n[FF6347]━━━━━━━"
                                        P = await SEndMsG(response.Data.chat_type, processing_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                        

                                        total_success = 0
                                        total_failed = 0
                                        
                                        for target_uid in uids:
                                            try:
                                                spam_result = spam_requests(target_uid)

                                                if "Success:" in spam_result:
                                                    success_count = int(spam_result.split("Success:")[1].split("\n")[0].split()[0])
                                                    failed_count = int(spam_result.split("Failed:")[1].split("\n")[0].split()[0])
                                                    total_success += success_count
                                                    total_failed += failed_count
                                                await asyncio.sleep(0.3) 
                                            except:
                                                total_failed += 1
                                        
                                        # Final result
                                        final_result = f"[FF6347][B]━━━━━━━\n[00FF00]✅ Total Success: {total_success}\n[FF0000]❌ Total Failed: {total_failed}\n[FF6347]━━━━━━━\n[FFB300]MASRY BOT"
                                        P = await SEndMsG(response.Data.chat_type, final_result, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                    else:
                                        error_msg = f"[FF0000]Usage: /spam [UID] or /spam [UID1] [UID2] [UID3] [UID4]"
                                        P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                else:
                                    error_msg = f"[FF0000]Usage: /spam [UID] or /spam [UID1] [UID2] [UID3] [UID4]"
                                    P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                    await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                            except:
                                error_msg = f"[FF0000]Spam error"
                                P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                        

                        if inPuTMsG.strip().startswith('/lag '):
                            print('Processing lag command in any chat type')
                            
                            parts = inPuTMsG.strip().split()
                            if len(parts) < 2:
                                error_msg = f"[B][C][FF0000]ERROR! Usage: /lag (team_code)\nExample: /lag ABC123\n"
                                await safe_send_message(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                            else:
                                team_code = parts[1]
                                

                                if lag_task and not lag_task.done():
                                    lag_running = False
                                    lag_task.cancel()
                                    await asyncio.sleep(0.1)
                                
                                lag_running = True
                                lag_task = asyncio.create_task(lag_team_loop(team_code, key, iv, region))
                                

                                success_msg = f"[B][C][00FF00]✅ SUCCESS! Lag attack started!\nTeam: {team_code}\nAction: Rapid join/leave\nSpeed: Ultra fast (milliseconds)\n"
                                await safe_send_message(response.Data.chat_type, success_msg, uid, chat_id, key, iv)

                        if inPuTMsG.strip() == '/stop lag':
                            if lag_task and not lag_task.done():
                                lag_running = False
                                lag_task.cancel()
                                success_msg = f"[B][C][00FF00]✅ SUCCESS! Lag attack stopped successfully!\n"
                                await safe_send_message(response.Data.chat_type, success_msg, uid, chat_id, key, iv)
                            else:
                                error_msg = f"[B][C][FF0000]❌ ERROR! No active lag attack to stop!\n"
                                await safe_send_message(response.Data.chat_type, error_msg, uid, chat_id, key, iv)


                        elif inPuTMsG.startswith('evo'):
                            try:
                                parts = inPuTMsG.split()
                                if len(parts) < 2:
                                    msg = "[FF0000]Usage: evo UID1 UID2"
                                    P = await SEndMsG(response.Data.chat_type, msg, uid, chat_id, key, iv)
                                    await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                    continue

                                uids = []
                                for part in parts[1:]:
                                    if part.isdigit():
                                        uids.append(int(part))

                                if not uids:
                                    msg = "[FF0000]No valid UIDs!"
                                    P = await SEndMsG(response.Data.chat_type, msg, uid, chat_id, key, iv)
                                    await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                    continue

                                start_msg = f"[00FF00]EVO Cycle Started for {len(uids)} UIDs!\nUse !stop to stop."
                                P = await SEndMsG(response.Data.chat_type, start_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)

                                asyncio.create_task(evo_cycle_command(uids, key, iv, region))

                            except Exception as e:
                                err = "[FF0000]EVO cycle error"
                                P = await SEndMsG(response.Data.chat_type, err, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
 
                        elif inPuTMsG.startswith('stop'):
                            await stop_commands()
                            msg = "[FF0000]Stopped all running commands!"
                            P = await SEndMsG(response.Data.chat_type, msg, uid, chat_id, key, iv)
                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)

                        elif inPuTMsG.startswith('/3') or inPuTMsG.startswith('/5') or inPuTMsG.startswith('/6'):
                            update_command_stats("squad_create")
                            try:
                                squad_size = int(inPuTMsG[1])
                                
                                message = f"[B][C]{get_random_color()}\n🎯 {squad_size}-Player Squad!\nAccept Fast"
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                
                                PAc = await OpEnSq(key, iv, region)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', PAc)
                                C = await cHSq(squad_size, uid, key, iv, region)
                                await asyncio.sleep(0.3)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', C)
                                V = await SEnd_InV(squad_size, uid, key, iv, region)
                                await asyncio.sleep(0.3)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', V)
                                E = await ExiT(None, key, iv)
                                await asyncio.sleep(2)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', E)
                                
                                confirm_msg = f"[00FF00][B]✅ {squad_size}-Player Squad!"
                                P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                            except Exception as e:
                                print(f'Error in {inPuTMsG} command')
                                
                        elif inPuTMsG.startswith('/solo'):
                            update_command_stats("solo")
                            try:
                                message = f"[FF6347][B]Leaving Squad..."
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                leave = await ExiT(uid, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', leave)
                                
                                confirm_msg = f"[00FF00][B]✅ Left Squad!"
                                P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                            except:
                                pass
                                
                        elif inPuTMsG.strip().startswith('/start'):
                            update_command_stats("speed")
                            try:
                                message = f"""[C][B]
مرحبًا بكم في  {get_random_color()} 
\n {get_random_color()} {dev_name} BOT

[C][B] لتواصل مع المطورين البوت

[808080]- Follow Me On my tik tok account => [00ff00] {tok}

[808080]- DmWith Me On my telegram account => [00ff00]{owner_user}

[808080]- Follow Me On my Instagram account => [00ff00] {insta}\n
"""
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                EM = await FS(key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', EM)
                                
                                confirm_msg = f"[{get_random_color()}[B]لعرض  الاوامر ارسل  /َََ🗿help"
                                P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                            except:
                                pass

                        elif inPuTMsG.strip().startswith('/e '):
                            update_command_stats("emote")
                            try:
                                parts = inPuTMsG.strip().split()
                                if len(parts) >= 3:  
                                    try:

                                        if len(parts) == 3:
                                            target_uid = int(parts[1])
                                            emote_id = int(parts[2])
                                            

                                            message = f'[B][C]{get_random_color()}\n🎭 Emote: {emote_id} → {target_uid}'
                                            P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                            
                                            H = await Emote_k(target_uid, emote_id, key, iv, region)
                                            await SEndPacKeT(whisper_writer, online_writer, 'OnLine', H)
                                            
                                            confirm_msg = f"[00FF00][B]✅ Emote Sent!"
                                            P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                                            
                                        elif len(parts) >= 4: 
                                            uids = []
                                            emote_id = None
                                            
                                            for i, part in enumerate(parts[1:], 1):
                                                if i < len(parts) - 1:  
                                                    if part.isdigit():
                                                        uids.append(int(part))
                                                else: 
                                                    if part.isdigit():
                                                        emote_id = int(part)
                                            
                                            if len(uids) >= 1 and emote_id:

                                                message = f'[B][C]{get_random_color()}\n🎭 Multi-Emote: {len(uids)} UIDs\nEmote ID: {emote_id}'
                                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                                
                                                success_count = 0
                                                for target_uid in uids:
                                                    try:
                                                        H = await Emote_k(target_uid, emote_id, key, iv, region)
                                                        await SEndPacKeT(whisper_writer, online_writer, 'OnLine', H)
                                                        success_count += 1
                                                        await asyncio.sleep(0.2)  
                                                    except:
                                                        pass
                                                
                                                confirm_msg = f"[00FF00][B]✅ Multi-Emote Sent! {success_count}/{len(uids)}"
                                                P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                                            else:
                                                error_msg = f"[FF0000]Invalid format. Use:\n/e [UID] [EMOTE]\n/e [UID1] [UID2] [UID3] [UID4] [EMOTE]"
                                                P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                        else:
                                            error_msg = f"[FF0000]Usage: /e [UID] [EMOTE] or /e [UID1] [UID2] [UID3] [UID4] [EMOTE]"
                                            P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                            await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                            
                                    except ValueError:
                                        error_msg = f"[FF0000]Invalid UID or Emote ID. Use numbers only."
                                        P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                        await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                else:
                                    error_msg = f"[FF0000]Usage: /e [UID] [EMOTE] or /e [UID1] [UID2] [UID3] [UID4] [EMOTE]"
                                    P = await SEndMsG(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                                    await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)

                            except Exception as e:
                                print(f"Error in /e command: {e}")

                        elif inPuTMsG.startswith('/join '):
                            update_command_stats("join_squad")
                            try:
                                Code = inPuTMsG.split('join ')[1]
                                message = f"[B][C]{get_random_color()}\n🎯 Joining: {Code}"
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                EM = await GenJoinSquadsPacket(Code, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', EM)
                                
                                confirm_msg = f"[00FF00][B]✅ Join Request! Code: {Code}"
                                P_confirm = await SEndMsG(response.Data.chat_type, confirm_msg, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P_confirm)
                            except:
                                print("Error in /join command")

                        if inPuTMsG.strip().startswith('/ai '):
                            print('Processing AI command in any chat type')
                            
                            question = inPuTMsG[4:].strip()
                            if question:
                                initial_message = f"[B][C]{get_random_color()}\n🤖 AI is thinking...\n"
                                await safe_send_message(response.Data.chat_type, initial_message, uid, chat_id, key, iv)
                                

                                loop = asyncio.get_event_loop()
                                with ThreadPoolExecutor() as executor:
                                    ai_response = await loop.run_in_executor(executor, talk_with_ai, question)
                                

                                ai_message = f"""
[C][B]{get_random_color()}{ai_response}
"""
                                await safe_send_message(response.Data.chat_type, ai_message, uid, chat_id, key, iv)
                            else:
                                error_msg = f"[B][C][FF0000]❌ ERROR! Please provide a question after /ai\nExample: /ai What is Free Fire?\n"
                                await safe_send_message(response.Data.chat_type, error_msg, uid, chat_id, key, iv)


                        if inPuTMsG.strip().startswith('/inv '):
                            print('Processing invite command in any chat type')
                            
                            parts = inPuTMsG.strip().split()
                            if len(parts) < 2:
                                error_msg = f"[B][C][FF0000]❌ ERROR! Usage: /inv (uid)\nExample: /inv 123456789\n"
                                await safe_send_message(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
                            else:
                                target_uid = parts[1]
                                initial_message = f"[B][C]{get_random_color()}\nCreating 5-Player Group and sending request to {target_uid}...\n"
                                await safe_send_message(response.Data.chat_type, initial_message, uid, chat_id, key, iv)
                                
                                try:

                                    PAc = await OpEnSq(key, iv, region)
                                    await SEndPacKeT(whisper_writer, online_writer, 'OnLine', PAc)
                                    await asyncio.sleep(0.3)
                                    
                                    C = await cHSq(5, int(target_uid), key, iv, region)
                                    await SEndPacKeT(whisper_writer, online_writer, 'OnLine', C)
                                    await asyncio.sleep(0.3)
                                    
                                    V = await SEnd_InV(5, int(target_uid), key, iv, region)
                                    await SEndPacKeT(whisper_writer, online_writer, 'OnLine', V)
                                    await asyncio.sleep(0.3)
                                    
                                    E = await ExiT(None, key, iv)
                                    await asyncio.sleep(2)
                                    await SEndPacKeT(whisper_writer, online_writer, 'OnLine', E)
                                    
                                    success_message = f"[B][C][00FF00]✅ SUCCESS! 5-Player Group invitation sent successfully to {target_uid}!\n"
                                    await safe_send_message(response.Data.chat_type, success_message, uid, chat_id, key, iv)
                                    
                                except Exception as e:
                                    error_msg = f"[B][C][FF0000]❌ ERROR sending invite: {str(e)}\n"
                                    await safe_send_message(response.Data.chat_type, error_msg, uid, chat_id, key, iv)
 

                        elif inPuTMsG.strip().startswith('/admin'):
                            update_command_stats("show")
                            try:
                                message = f"""[C][B]{get_random_color()}Hello Im Dev 
                                {get_random_color()}{dev_name}\n\n{get_random_color()}Tele: {owner_user}\n
                                 {get_random_color()}insta :  {insta} \n 
                                 {get_random_color()}tik : @3mk_eg"""
                                P = await SEndMsG(response.Data.chat_type, message, uid, chat_id, key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'ChaT', P)
                                EM = await FS(key, iv)
                                await SEndPacKeT(whisper_writer, online_writer, 'OnLine', EM)

                            except:
                                pass                       
                        
            whisper_writer.close() 
            await whisper_writer.wait_closed() 
            whisper_writer = None
                    	
        except Exception as e: 
            print(f"ErroR {ip}:{port} - {e}") 
            whisper_writer = None
        await asyncio.sleep(reconnect_delay)

async def MaiiiinE():
    global connection_pool
    connection_pool = aiohttp.ClientSession(
        timeout=aiohttp.ClientTimeout(total=20),
        connector=aiohttp.TCPConnector(limit=20, limit_per_host=10)
    )
    
    Uid , Pw = ' 4256907901',' 17B89B6DD17A9145E66B1869AE72DAB152DDE89657D84D804197A9F7E24E435D'

    open_id , access_token = await GeNeRaTeAccEss(Uid , Pw)
    if not open_id or not access_token: 
        print("ErroR - InvaLid AccounT") 
        return None
    
    PyL = await EncRypTMajoRLoGin(open_id , access_token)
    MajoRLoGinResPonsE = await MajorLogin(PyL)
    if not MajoRLoGinResPonsE: 
        print("TarGeT AccounT => BannEd / NoT ReGisTeReD ! ") 
        return None
    
    MajoRLoGinauTh = await DecRypTMajoRLoGin(MajoRLoGinResPonsE)
    UrL = MajoRLoGinauTh.url
    print(UrL)
    region = MajoRLoGinauTh.region

    ToKen = MajoRLoGinauTh.token
    TarGeT = MajoRLoGinauTh.account_uid
    key = MajoRLoGinauTh.key
    iv = MajoRLoGinauTh.iv
    timestamp = MajoRLoGinauTh.timestamp
    
    LoGinDaTa = await GetLoginData(UrL , PyL , ToKen)
    if not LoGinDaTa: 
        print("ErroR - GeTinG PorTs From LoGin DaTa !") 
        return None
    LoGinDaTaUncRypTinG = await DecRypTLoGinDaTa(LoGinDaTa)
    OnLinePorTs = LoGinDaTaUncRypTinG.Online_IP_Port
    ChaTPorTs = LoGinDaTaUncRypTinG.AccountIP_Port
    OnLineiP , OnLineporT = OnLinePorTs.split(":")
    ChaTiP , ChaTporT = ChaTPorTs.split(":")
    acc_name = LoGinDaTaUncRypTinG.AccountName
    print(ToKen)
    equie_emote(ToKen,UrL)
    AutHToKen = await xAuThSTarTuP(int(TarGeT) , ToKen , int(timestamp) , key , iv)
    ready_event = asyncio.Event()
    
    task1 = asyncio.create_task(TcPChaT(ChaTiP, ChaTporT , AutHToKen , key , iv , LoGinDaTaUncRypTinG , ready_event ,region))
     
    await ready_event.wait()
    await asyncio.sleep(1)
    task2 = asyncio.create_task(TcPOnLine(OnLineiP , OnLineporT , key , iv , AutHToKen))
    os.system('clear')
    print(render('MASRY  BOT', colors=['white', 'green'], align='center'))
    print('')
    print(f" - MASRY BOT STarTinG And OnLine on TarGet : {TarGeT} | BOT NAME : {acc_name}\n")
    print(f" - BoT sTaTus > GooD | OnLinE ! (:")    
    print(f" - DEV: masry | Bot Uptime: {time.strftime('%H:%M:%S', time.gmtime(time.time() - bot_start_time))}")    
    await asyncio.gather(task1 , task2)
    
async def StarTinG():
    while True:
        try: 
            await asyncio.wait_for(MaiiiinE() , timeout = 7 * 60 * 60)
        except asyncio.TimeoutError: 
            print("Token ExpiRed ! , ResTartinG")
        except Exception as e: 
            print(f"ErroR TcP - {e} => ResTarTinG ...")

if __name__ == '__main__':
    asyncio.run(StarTinG())