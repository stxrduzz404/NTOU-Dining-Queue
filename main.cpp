#include <iomanip>
#include <iostream>
#include <limits>
#include <queue>
#include <string>

using namespace std;

struct Customer {
    int no;
    string name;
    string phone;
    int partySize;
    string area;
};

queue<Customer> waiting;
int nextNo = 1;

string ticketNo(int no) {
    string number = to_string(no);
    return "A" + string(3 - min(3, static_cast<int>(number.length())), '0') + number;
}

void joinQueue(const string& name, const string& phone, int partySize, const string& area) {
    Customer customer = {nextNo, name, phone, partySize, area};
    nextNo++;
    waiting.push(customer);

    cout << "\n[登記完成] 號碼：" << ticketNo(customer.no)
         << "｜前方 " << waiting.size() - 1 << " 組\n";
}

void callNext() {
    if (waiting.empty()) {
        cout << "\n目前沒有候位客人。\n";
        return;
    }

    Customer customer = waiting.front();
    cout << "\n[叫號] " << ticketNo(customer.no) << " " << customer.name
         << "｜" << customer.partySize << " 人｜請準備入座。\n";
    waiting.pop();
}

void peekNext() {
    if (waiting.empty()) {
        cout << "\n目前沒有下一位。\n";
        return;
    }

    const Customer& customer = waiting.front();
    cout << "\n[下一位] " << ticketNo(customer.no) << " " << customer.name
         << "｜" << customer.partySize << " 人\n";
}

void showAll() {
    if (waiting.empty()) {
        cout << "\n目前沒有候位客人。\n";
        return;
    }

    queue<Customer> copy = waiting;
    int order = 1;

    cout << "\n========== 候位名單 ==========\n";
    cout << left << setw(6) << "順序" << setw(8) << "號碼" << setw(14) << "姓名"
         << setw(8) << "人數" << setw(14) << "區域" << "電話\n";
    cout << string(64, '-') << "\n";

    while (!copy.empty()) {
        Customer customer = copy.front();
        cout << left << setw(6) << order << setw(8) << ticketNo(customer.no)
             << setw(14) << customer.name << setw(8) << customer.partySize
             << setw(14) << customer.area << customer.phone << "\n";
        copy.pop();
        order++;
    }
}

int ahead(int no) {
    queue<Customer> copy = waiting;
    int count = 0;

    while (!copy.empty()) {
        if (copy.front().no == no) return count;
        count++;
        copy.pop();
    }
    return -1;
}

int readNumber() {
    int value;
    while (!(cin >> value)) {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "請輸入數字：";
    }
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    return value;
}

void printMenu() {
    cout << "\n================================\n";
    cout << "  海味候位｜海大餐廳排隊系統\n";
    cout << "================================\n";
    cout << "1. 登記候位 (push)\n";
    cout << "2. 叫下一位 (front + pop)\n";
    cout << "3. 查看下一位 (front)\n";
    cout << "4. 顯示候位名單\n";
    cout << "5. 查詢前方組數\n";
    cout << "0. 結束系統\n";
    cout << "--------------------------------\n";
    cout << "候位：" << waiting.size() << " 組｜下一張：" << ticketNo(nextNo) << "\n";
    cout << "請選擇：";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    while (true) {
        printMenu();
        int choice = readNumber();

        if (choice == 0) {
            cout << "\n系統已結束，謝謝使用。\n";
            break;
        }

        if (choice == 1) {
            string name, phone, area;
            cout << "姓名：";
            getline(cin, name);
            cout << "手機：";
            getline(cin, phone);
            cout << "用餐人數：";
            int partySize = readNumber();
            cout << "座位區域（不限／靠窗區／一般座位／多人座位）：";
            getline(cin, area);
            if (area.empty()) area = "不限";
            joinQueue(name, phone, partySize, area);
        } else if (choice == 2) {
            callNext();
        } else if (choice == 3) {
            peekNext();
        } else if (choice == 4) {
            showAll();
        } else if (choice == 5) {
            cout << "輸入號碼（只輸入數字，例如 3）：";
            int no = readNumber();
            int count = ahead(no);
            if (count == -1) {
                cout << "\n名單中找不到 " << ticketNo(no) << "。\n";
            } else {
                cout << "\n" << ticketNo(no) << " 前面還有 " << count << " 組。\n";
            }
        } else {
            cout << "\n沒有這個選項，請重新輸入。\n";
        }
    }

    return 0;
}
