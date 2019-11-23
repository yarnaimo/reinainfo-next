export let send: any

beforeEach(() => {
    send = jest.fn().mockResolvedValue({ text: 'ok' })
})

export const IncomingWebhook = function(this: any) {
    this.send = send
}
