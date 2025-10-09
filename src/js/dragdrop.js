/**
 * DragDropModule - ドラッグ&ドロップUI機能
 * 抽出アイテム→フィールド、フィールド間のD&Dを管理
 */
class DragDropModule {
    constructor() {
        this.dragDropInProgress = false;
    }

    /**
     * 抽出アイテムリストをUIに表示
     * @param {Array} extractedItems - 抽出されたアイテムの配列
     */
    populateExtractedItems(extractedItems) {
        const container = document.getElementById('items-container');
        container.innerHTML = '';

        if (extractedItems.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; font-style: italic; margin: 0;">抽出された追加情報はありません</p>';
            return;
        }

        extractedItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'draggable-item';
            itemElement.draggable = true;
            itemElement.textContent = item.text;
            itemElement.dataset.index = index;
            itemElement.dataset.text = item.text;

            // Add drag event listeners
            itemElement.addEventListener('dragstart', this.handleDragStart.bind(this));
            itemElement.addEventListener('dragend', this.handleDragEnd.bind(this));

            container.appendChild(itemElement);
        });
    }

    /**
     * フォームフィールドにドラッグ&ドロップ機能を設定
     */
    setup() {
        const dropZones = document.querySelectorAll('.drop-zone');

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));

            // Make input fields draggable
            const input = zone.querySelector('input, textarea');
            if (input) {
                input.draggable = true;
                input.addEventListener('dragstart', this.handleFieldDragStart.bind(this));
                input.addEventListener('dragend', this.handleFieldDragEnd.bind(this));
            }
        });
    }

    // ========== Drag Event Handlers ==========

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.text);
        e.dataTransfer.setData('application/x-item-index', e.target.dataset.index);
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleFieldDragStart(e) {
        const value = e.target.value.trim();
        if (value) {
            e.dataTransfer.setData('text/plain', value);
            e.dataTransfer.setData('application/x-field-source', e.target.id);
            e.target.classList.add('field-dragging');
        } else {
            e.preventDefault();
        }
    }

    handleFieldDragEnd(e) {
        e.target.classList.remove('field-dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        // Prevent multiple drop events
        if (this.dragDropInProgress) {
            return;
        }
        this.dragDropInProgress = true;

        const text = e.dataTransfer.getData('text/plain');
        const itemIndex = e.dataTransfer.getData('application/x-item-index');
        const sourceFieldId = e.dataTransfer.getData('application/x-field-source');
        const fieldName = e.currentTarget.dataset.field;

        if (text && fieldName) {
            const input = e.currentTarget.querySelector('input, textarea');
            if (input) {
                if (sourceFieldId) {
                    // Field-to-field drag
                    const sourceField = document.getElementById(sourceFieldId);
                    if (sourceField && sourceField !== input) {
                        this.handleFieldToFieldDrop(sourceField, input, text);
                    }
                } else {
                    // Extracted item drag
                    this.handleItemToFieldDrop(input, text, fieldName, itemIndex);
                }
            }
        }

        // Reset flag after delay
        setTimeout(() => {
            this.dragDropInProgress = false;
        }, 200);
    }

    /**
     * 抽出アイテムからフィールドへのドロップ処理
     */
    handleItemToFieldDrop(input, text, fieldName, itemIndex) {
        if (input.value.trim() === '') {
            input.value = text;
        } else {
            const fieldLabel = this.getFieldLabel(fieldName);
            const replace = confirm(`「${fieldLabel}」の既存の値を「${text}」で置き換えますか？\n\nキャンセルすると末尾に追加されます。`);

            if (replace) {
                input.value = text;
            } else {
                input.value += (input.tagName === 'TEXTAREA' ? '\n' : ' ') + text;
            }
        }

        // Mark item as used
        if (itemIndex !== null) {
            const item = document.querySelector(`[data-index="${itemIndex}"]`);
            if (item) {
                item.classList.add('used');
                item.draggable = false;
            }
        }

        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * フィールド間のドロップ処理（スワップまたはコピー）
     */
    handleFieldToFieldDrop(sourceField, targetField, text) {
        const sourceValue = sourceField.value.trim();
        const targetValue = targetField.value.trim();

        if (targetValue === '') {
            // 移動
            targetField.value = sourceValue;
            sourceField.value = '';

            sourceField.dispatchEvent(new Event('input', { bubbles: true }));
            targetField.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            // スワップまたはコピー
            setTimeout(() => {
                const action = confirm(`「${sourceValue}」を移動しますか？\n\nOK = 移動（値を入れ替え）\nキャンセル = コピー（元の値は保持）`);

                if (action) {
                    // Swap
                    targetField.value = sourceValue;
                    sourceField.value = targetValue;
                } else {
                    // Copy
                    const replace = confirm(`「${targetValue}」を「${sourceValue}」で置き換えますか？\n\nキャンセルすると末尾に追加されます。`);
                    if (replace) {
                        targetField.value = sourceValue;
                    } else {
                        targetField.value += (targetField.tagName === 'TEXTAREA' ? '\n' : ' ') + sourceValue;
                    }
                }

                sourceField.dispatchEvent(new Event('input', { bubbles: true }));
                targetField.dispatchEvent(new Event('input', { bubbles: true }));
            }, 50);
        }
    }

    /**
     * フィールド名から日本語ラベルを取得
     */
    getFieldLabel(fieldName) {
        const labels = {
            'lastName': '苗字',
            'firstName': '名前',
            'company': '会社名',
            'title': '役職',
            'mobilePhone': '携帯電話',
            'officePhone': '会社電話',
            'email': 'メールアドレス',
            'website': 'ウェブサイト',
            'address': '住所'
        };
        return labels[fieldName] || fieldName;
    }
}

// Export for use in other files
window.DragDropModule = DragDropModule;
