module.exports = {
  onInput ({ currentTarget: { dataset }, detail: { value } }) {
    const { name, noTrim, formData, formName } = dataset
    const newValue = noTrim ? value : (value.trim ? value.trim() : value)
    // 处理form对象上的数据，因表单上的数据一般放在form对象里统一处理。
    if (formName && formData) {
      formData[name] = newValue
      this.setData({ [formName]: formData })
      console.log(`this.data.${formName}`, this.data[formName])
      return
    }
    // 处理data上的数据
    this.setData({ [name]: newValue })
    console.log(`this.data.${name}`, this.data[name])
  }
}
