const wait_ms = async (ms) => 
{
    return new Promise(resolve => setTimeout(resolve, ms))
}

const wait_s = async (s) => 
{
    return wait_ms(s * 1000);
}

const wait_min = async (min) => 
{
    return wait_s(min * 60);
}

const wait_hr = async (hr) => 
{
    return wait_min(hr * 60);
}

module.exports = {
    wait_ms,
    wait_s,
    wait_min,
    wait_hr
};