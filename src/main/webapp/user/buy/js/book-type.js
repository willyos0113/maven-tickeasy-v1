// ==================== 載入模組 (All Imports At Top) ====================
import { getUrlParam, getContextPath } from "../../common/utils.js";
import {
  BOOKING_PROGRESS,
  ERROR_MESSAGES,
  OTHER_CONSTS,
} from "../../common/constant.js";
import {
  fetchNavTemplate,
  renderNav,
  initNavJSEvents,
} from "../../layout/nav/nav.js";
import {
  fetchHeaderTemplate,
  fetchTicketEvent,
  renderHeader,
} from "../ui/header.js";
import {
  fetchTicketType,
  fetchTypeBoxTemplate,
  renderTypeBox,
  initTypeBoxJSEvents,
  fetchRemainingTicketCount,
} from "../ui/book-type/type-box.js";
import {
  fetchFooterTemplate,
  renderFooter,
} from "../../layout/footer/footer.js";

// ==================== 1. API 服務層 (API Service Layer) ====================
// 這些函數負責與後端 API 進行互動，處理請求的發送和響應的接收。

/**
 * 將選定的票種和數量，儲存到後端 Redis，並跳轉至下一頁。
 * @param {Object} book - 包含票種選擇訊息的物件。
 */
const saveBook = async (book) => {
  const eventId = getUrlParam("eventId");

  // 如果 eventId 缺少
  if (book.eventId <= 0) {
    $("#error-message")
      .find(".book-type-message")
      .text(ERROR_MESSAGES.MISSING_EVENT_ID);
    $("#error-message").removeClass("is-hidden");
    return;
  }

  // 如果 book 的 quantity 總和小於 0，請再次選擇票券數
  let totalNum = 0;
  book["selected"].forEach((ticketType) => {
    totalNum += ticketType.quantity;
  });
  if (totalNum <= 0) {
    $("#error-message")
      .find(".book-type-message")
      .text(ERROR_MESSAGES.NO_TICKETS_SELECTED);
    $("#error-message").removeClass("is-hidden");
    return;
  }

  // 將 book 傳遞至後端並儲存至 Redis
  const resp = await fetch(`${getContextPath()}/book-type`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  const { authStatus, dataStatus, message, successful } = await resp.json();

  // 要求使用者，請先登入
  if (authStatus === "NOT_LOGGED_IN") {
    // alert(message);
    await Swal.fire(message);
    sessionStorage.setItem("core-message", message);
    sessionStorage.setItem("core-successful", successful);
    location.href = `${getContextPath()}/user/member/login.html`;
    return;
  }

  // 跳轉下一頁(book-info.html)
  sessionStorage.setItem("core-message", message);
  sessionStorage.setItem("core-successful", successful);
  location.href = `${getContextPath()}/user/buy/book-info.html?eventId=${eventId}`;
};

// ==================== 2. 數據處理層 (Data Processing) ====================
// 這些函數負責從 DOM 中提取數據，並對數據進行格式化或轉換。

/**
 * 從頁面中抓取所有票種輸入框的 quantity 並加入 book 物件中
 * @param {Object} book - book 物件。
 */
const addTicketTypeToSelected = (book) => {
  const $typeBoxList = $(".type-box");

  // 抓取票種資料
  const typeSelected = $typeBoxList.map((index, typeBox) => {
    const $typeBox = $(typeBox);
    const typeId = $typeBox.data("typeId");
    const categoryName = $typeBox.find(".type-name").text();
    const quantity = $typeBox.find(".type-quantity").val();
    return { typeId, categoryName, quantity };
  });

  // 將票種資料存入 book 當中
  book.selected = typeSelected.get();
};

// ==================== 3. DOM 事件處理與頁面邏輯 (DOM Events & Page Logic) ====================
// 這是主要頁面邏輯的入口點，負責綁定事件和協調不同層級的函數。

/**
 * 架設 book-type 頁面上所有事件監聽器。
 * @param {Object} book - 儲存票券訂購資訊。
 */
const initBookTypeJSEvents = (book) => {
  // 共同變數，url 後方的活動 id
  const eventId = getUrlParam("eventId");

  // ====== "更新票券" 按鈕點擊事件 ======
  $(".update").on("click", async (e) => {
    // 改變按鈕樣式
    $(".updating").removeClass("is-hidden");
    $(".update").addClass("is-hidden");

    // 取得票種、eventId
    const eventId = getUrlParam("eventId");
    const typeIdArr = await fetchTicketType(eventId);

    // 更新所有票種的剩餘票數
    const remainingTicketCountArr = [];
    for (const type of typeIdArr) {
      const { typeId } = type;
      const { count, message, successful } = await fetchRemainingTicketCount(
        eventId,
        typeId
      );
      $(`[data-type-id='${typeId}']`).find("span.tag").text(`剩餘 ${count}`);
      remainingTicketCountArr.push({ count, message, successful });
    }

    // 完成剩餘票數更新，判斷成功與否?
    for (const { successful, message } of remainingTicketCountArr) {
      if (!successful) {
        // 顯示失敗訊息，恢復按鈕樣式
        setTimeout(() => {
          $("#error-message").find(".book-type-message").text(message);
          $("#error-message").removeClass("is-hidden");
          $(".updating").addClass("is-hidden");
          $(".update").removeClass("is-hidden");
        }, OTHER_CONSTS.ANIMATION_TRANSITION);
        return;
      }
    }
    // 成功，恢復按鈕樣式
    setTimeout(() => {
      $(".updating").addClass("is-hidden");
      $(".update").removeClass("is-hidden");
    }, OTHER_CONSTS.ANIMATION_TRANSITION);
  });
  // ====== "更新票券" 按鈕 blur 事件 ======
  $(".update").on("blur", () => {
    $(".book-type-message").text("");
    $("#error-message").addClass("is-hidden");
    $("#success-message").addClass("is-hidden");
  });

  // ====== "上一步" 按鈕點擊事件 ======
  $(".back").on("click", () => {
    // 回到活動頁面
    location.href = `${getContextPath()}/user/buy/event_ticket_purchase.html?eventId=${eventId}`;
  });

  // ====== "下一步" 按鈕點擊事件 ======
  $(".next").on("mouseenter mouseleave", (e) => {
    $(e.target).toggleClass("is-focused");
  });
  $(".next").on("click", async () => {
    addTicketTypeToSelected(book);
    book.progress = BOOKING_PROGRESS.INFO_FILLING; // 選票完成，進入下一步
    saveBook(book);
  });

  // ====== "下一步" 按鈕 blur 事件 ======
  $(".next").on("blur", () => {
    $("#error-message").find(".book-type-message").text("");
    $("#error-message").addClass("is-hidden");
  });
};

// ==================== 4. UI 渲染層 (UI Rendering Layer) ====================
// 這些函數負責動態生成或更新 HTML 內容。

/**
 * 將圖片插入 img 標籤中。
 * @param {string} image - 圖片資料。
 */
const renderImage = ({ image }) => {
  const imageSrcLink = `data:image/jpeg;base64,${image}`;
  if (image) {
    $(".card-image").find("img").attr("src", imageSrcLink);
  }
};

// ==================== 5. 頁面初始化 (Initialization) ====================
// 確保 DOM 加載完成後再執行初始化邏輯

(async () => {
  // ====== 資料儲存變數區 ======
  const book = {
    // 活動 id
    eventId: null,
    // 活動名
    eventName: null,
    // 購票人帳號
    userName: null,
    // 流程進度
    progress: BOOKING_PROGRESS.TYPE_SELECTION,
    // 選擇票種結果 [type1, type2, ...]
    selected: [],
    // 聯絡人資訊 {...}
    contact: null,
    // 入場者資訊 [attendee1, attendee2, ...]
    attendee: [],
  };

  // ====== nav 部分 ======
  const navTemplate = await fetchNavTemplate();
  await renderNav(navTemplate);
  initNavJSEvents();

  // ====== header 部分 ======
  const eventId = getUrlParam("eventId");
  // 存入 eventId
  book.eventId = eventId;
  const headerTemplate = await fetchHeaderTemplate();
  const eventInfo = await fetchTicketEvent(eventId);
  // 存入 book 變數中，儲存 eventName
  book.eventName = eventInfo.eventName;
  // 輸出 header.html 模板(顯示對應進度條、活動名稱)
  renderHeader(eventInfo, book, headerTemplate);

  // ====== type-box 部分 ======
  const ticketType = await fetchTicketType(eventId);
  const typeBoxTemplate = await fetchTypeBoxTemplate();
  // 輸出 type-box.html 模板
  renderTypeBox(ticketType, typeBoxTemplate);
  // 監聽事件
  initTypeBoxJSEvents();

  // ====== book-type 部分 ======
  renderImage(eventInfo);
  initBookTypeJSEvents(book); // book 傳入，接收購票人選擇的票數 quantity 並送到後端

  // ====== footer 部分 ======
  const footerTemplate = await fetchFooterTemplate();
  await renderFooter(footerTemplate);
})();
