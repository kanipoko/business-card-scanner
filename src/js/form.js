/**
 * FormModule - フォーム管理とデータ処理
 */
class FormModule {
    /**
     * APIレスポンスからフォームにデータを入力
     * @param {Object} data - 抽出された名刺データ
     */
    populate(data) {
        // 氏名を姓と名に分割
        const nameParts = this.splitName(data.name || '');
        document.getElementById('lastName').value = nameParts.lastName;
        document.getElementById('firstName').value = nameParts.firstName;

        // 基本情報
        document.getElementById('company').value = data.company || '';
        document.getElementById('title').value = data.title || '';

        // 電話番号（携帯/固定を分離）
        const phoneNumbers = this.splitPhoneNumbers(data.phone || '');
        document.getElementById('mobilePhone').value = phoneNumbers.mobile;
        document.getElementById('officePhone').value = phoneNumbers.office;

        // 連絡先
        document.getElementById('email').value = data.email || '';
        document.getElementById('website').value = data.website || '';
        document.getElementById('address').value = data.address || '';
    }

    /**
     * フルネームを姓と名に分割
     * @param {string} fullName - フルネーム
     * @returns {Object} { lastName, firstName }
     */
    splitName(fullName) {
        if (!fullName) return { lastName: '', firstName: '' };

        const nameParts = fullName.trim().split(/\s+/);

        if (nameParts.length === 1) {
            return { lastName: nameParts[0], firstName: '' };
        } else if (nameParts.length === 2) {
            return { lastName: nameParts[0], firstName: nameParts[1] };
        } else {
            // 3単語以上の場合、最初を姓、残りを名とする
            return { lastName: nameParts[0], firstName: nameParts.slice(1).join(' ') };
        }
    }

    /**
     * 電話番号を携帯/固定に分類
     * @param {string|Object} phoneData - 電話番号データ
     * @returns {Object} { mobile, office }
     */
    splitPhoneNumbers(phoneData) {
        if (!phoneData) return { mobile: '', office: '' };

        // オブジェクトの場合はそのまま返す
        if (typeof phoneData === 'object') {
            return {
                mobile: phoneData.mobile || '',
                office: phoneData.office || ''
            };
        }

        const phone = phoneData.trim();

        // 日本の携帯番号パターン (090, 080, 070)
        if (phone.match(/^(\+81-?)?0[789]0/)) {
            return { mobile: phone, office: '' };
        }

        // 固定電話パターン (03, 06など)
        if (phone.match(/^(\+81-?)?0[1-6]/)) {
            return { mobile: '', office: phone };
        }

        // 不明な場合は固定電話とする
        return { mobile: '', office: phone };
    }

    /**
     * フォームからコンタクトデータを取得
     * @returns {Object} vCard生成用のデータ
     */
    getContactData() {
        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const fullName = `${lastName} ${firstName}`.trim();

        return {
            name: fullName,
            lastName: lastName,
            firstName: firstName,
            company: document.getElementById('company').value.trim(),
            title: document.getElementById('title').value.trim(),
            mobilePhone: document.getElementById('mobilePhone').value.trim(),
            officePhone: document.getElementById('officePhone').value.trim(),
            email: document.getElementById('email').value.trim(),
            website: document.getElementById('website').value.trim(),
            address: document.getElementById('address').value.trim()
        };
    }

    /**
     * フォームをリセット
     */
    reset() {
        document.getElementById('contact-form').reset();
    }

    /**
     * ファイル名に使用できる安全な文字列を生成
     * @param {string} text - 元のテキスト
     * @returns {string} サニタイズされた文字列
     */
    sanitizeFileName(text) {
        return text.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_');
    }
}

// Export for use in other files
window.FormModule = FormModule;
